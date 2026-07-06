from models import Offer, Buyer, Pool, PoolMember, Farmer, PickupManifest, Allocation
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Import callback service stub for phase 2 farmer confirmation calls after settlement
try:
    import sys
    import os
    root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    if root_path not in sys.path:
        sys.path.append(root_path)
    from callback_service import call_farmer_for_confirmation
except Exception:
    pass



def save_offer(db, offer_data):
    # 1. Fetch buyer and verify they are not suspended
    buyer = db.query(Buyer).filter(Buyer.id == offer_data.buyer_id).first()
    if not buyer:
        return {"error": "Buyer not found"}
    if buyer.suspended:
        return {"error": "Buyer is suspended due to excessive no-shows"}
        
    # 2. Fetch pool with lock to prevent race conditions
    pool = db.query(Pool).filter(Pool.id == offer_data.pool_id).with_for_update().first()
    if not pool:
        return {"error": "Pool not found"}
    if pool.status != "AUCTION":
        return {"error": "Pool is not open for bidding"}
    if pool.auction_end_time and datetime.utcnow() > pool.auction_end_time:
        return {"error": "Auction has already closed"}

    # 3. Atomic check in DB: bid must be higher than current highest bid
    updated_rows = db.query(Pool).filter(
        Pool.id == offer_data.pool_id,
        Pool.status == "AUCTION",
        offer_data.price > Pool.current_highest_bid
    ).update({Pool.current_highest_bid: offer_data.price}, synchronize_session=False)

    if not updated_rows:
        return {"error": "Bid must be higher than the current highest bid"}

    # 4. Soft-close anti-sniping: extend auction end time by 60s if bid is placed in the final 60s
    now = datetime.utcnow()
    extended = False
    if pool.auction_end_time:
        time_left = (pool.auction_end_time - now).total_seconds()
        if 0 <= time_left <= 60:
            pool.auction_end_time += timedelta(seconds=60)
            extended = True

    # 5. Capture binding_bid
    binding = getattr(offer_data, "binding_bid", True)
    offer = Offer(
        buyer_id=offer_data.buyer_id,
        pool_id=offer_data.pool_id,
        price=offer_data.price,
        quantity=offer_data.quantity,
        timestamp=now,
        status="PENDING",
        allocated_quantity=0.0,
        binding_bid=binding
    )

    db.add(offer)
    db.commit()
    db.refresh(offer)

    # 6. Broadcast confirmed state post-write
    buyer_name = buyer.name if buyer else "Unknown"
    from socket_manager import emit_pool_bid, emit_pool_update
    emit_pool_bid(str(offer_data.pool_id), buyer_name, offer_data.price)

    if extended:
        farmers_count = db.query(PoolMember).filter(PoolMember.pool_id == pool.id).count()
        pool_data = {
            "poolId": str(pool.id),
            "crop": pool.crop.capitalize() if pool.crop else "",
            "location": pool.location,
            "currentQtyKg": pool.total_quantity,
            "targetQtyKg": 250.0,
            "farmersCount": farmers_count,
            "status": "auctioning",
            "auctionEndTime": pool.auction_end_time.isoformat() if pool.auction_end_time else None
        }
        emit_pool_update(str(pool.id), pool_data)

    return {
        "message": "Offer saved",
        "offer_id": offer.id
    }



def get_best_offer(db, pool_id):
    offer = db.query(Offer).filter(
        Offer.pool_id == pool_id
    ).order_by(
        Offer.price.desc()
    ).first()

    if offer is None:
        return {"message": "No offers yet"}

    return {
        "buyer_id": offer.buyer_id,
        "price": offer.price
    }


def get_all_offers(db, pool_id):
    offers = db.query(Offer).filter(
        Offer.pool_id == pool_id
    ).all()

    if len(offers) == 0:
        return {
            "message": "No offers found"
        }

    result = []

    for offer in offers:
        buyer = db.query(Buyer).filter(
            Buyer.id == offer.buyer_id
        ).first()

        result.append({
            "buyer_id": offer.buyer_id,
            "buyer_name": buyer.name if buyer else "Unknown",
            "price": offer.price
        })

    return result


def get_all_buyers(db):
    buyers = db.query(Buyer).all()

    if len(buyers) == 0:
        return {
            "message": "No buyers found"
        }

    result = []

    for buyer in buyers:
        result.append({
            "buyer_id": buyer.id,
            "name": buyer.name,
            "phone": buyer.phone,
            "crop": buyer.crop,
            "location": buyer.location,
            "min_quantity": buyer.min_quantity
        })

    return result

def create_buyer(db, buyer_data):
    buyer = Buyer(
        name=buyer_data.name,
        phone=buyer_data.phone,
        crop=buyer_data.crop,
        location=buyer_data.location,
        min_quantity=buyer_data.min_quantity
    )
    db.add(buyer)
    db.commit()
    db.refresh(buyer)
    return {
        "message": "Buyer created successfully",
        "buyer_id": buyer.id
    }

def update_buyer(db, buyer_id, buyer_data):
    buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
    if not buyer:
        return {"error": "Buyer not found"}
    
    if hasattr(buyer_data, 'name') and buyer_data.name is not None:
        buyer.name = buyer_data.name
    if hasattr(buyer_data, 'phone') and buyer_data.phone is not None:
        buyer.phone = buyer_data.phone
    if hasattr(buyer_data, 'crop') and buyer_data.crop is not None:
        buyer.crop = buyer_data.crop
    if hasattr(buyer_data, 'location') and buyer_data.location is not None:
        buyer.location = buyer_data.location
    if hasattr(buyer_data, 'min_quantity') and buyer_data.min_quantity is not None:
        buyer.min_quantity = buyer_data.min_quantity
        
    db.commit()
    db.refresh(buyer)
    return {
        "message": "Buyer updated successfully",
        "buyer_id": buyer.id
    }

def delete_buyer(db, buyer_id):
    buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
    if not buyer:
        return {"error": "Buyer not found"}
    
    db.delete(buyer)
    db.commit()
    return {"message": "Buyer deleted successfully"}


def get_farmers_sorted_by_pledge_time(db, pool_id: int):
    # Sort members by primary key ID ascending (proxy for earliest pledge)
    members = db.query(PoolMember).filter(PoolMember.pool_id == pool_id).order_by(PoolMember.id.asc()).all()
    farmers_list = []
    for m in members:
        farmer = db.query(Farmer).filter(Farmer.phone == m.farmer_phone).first()
        if not farmer:
            farmer = Farmer(
                phone=m.farmer_phone,
                name="Unknown Farmer",
                trust_score=100,
                success_count=0,
                no_show_count=0,
                transaction_count=0
            )
            db.add(farmer)
            db.commit()
        # Set dynamic attribute on model instance for easy access
        farmer.quantity = m.quantity
        farmer.member_id = m.id
        farmers_list.append(farmer)
    return farmers_list


def get_bids_sorted_by_price_desc(db, pool_id: int):
    offers = db.query(Offer).filter(Offer.pool_id == pool_id).order_by(Offer.price.desc()).all()
    bids = []
    for offer in offers:
        buyer = db.query(Buyer).filter(Buyer.id == offer.buyer_id).first()
        if buyer:
            offer.buyer = buyer
            offer.price_per_kg = offer.price
            bids.append(offer)
    return bids


def save_allocation(db, alloc):
    allocation = Allocation(
        pool_id=alloc["pool_id"],
        farmer_phone=alloc["farmer_phone"],
        farmer_name=alloc["farmer_name"],
        buyer_id=alloc["buyer_id"],
        buyer_name=alloc["buyer_name"],
        quantity=alloc["quantity"],
        price_per_kg=alloc["price_per_kg"]
    )
    db.add(allocation)
    db.commit()


def schedule_bulbul_confirmation(db, alloc):
    pool = db.query(Pool).filter(Pool.id == alloc["pool_id"]).first()
    crop = pool.crop if pool else "crop"
    try:
        import sys
        import os
        import asyncio
        root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        if root_path not in sys.path:
            sys.path.append(root_path)
        from callback_service import call_farmer_for_confirmation
        
        coro = call_farmer_for_confirmation(
            farmer_phone=alloc["farmer_phone"],
            buyer_name=alloc["buyer_name"],
            crop=crop,
            price_per_kg=alloc["price_per_kg"],
            quantity_kg=alloc["quantity"]
        )
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(coro)
        except RuntimeError:
            asyncio.run(coro)
    except Exception as e:
        logger.error(f"Error scheduling Bulbul confirmation callback: {e}")


def open_mini_auction(db, pool_id, quantity, discount_rate, farmers):
    pool = db.query(Pool).filter(Pool.id == pool_id).first()
    if not pool:
        return
    from services.mandi_service import get_mandi_price
    mandi_info = get_mandi_price(pool.crop, pool.location)
    mandi_price = mandi_info.get("mandi_price", 15.0) if mandi_info else 15.0
    discounted_reserve = round(mandi_price * (1 - discount_rate), 2)

    pool.status = "AUCTION"
    pool.current_highest_bid = discounted_reserve
    pool.auction_start_time = datetime.utcnow()
    pool.auction_end_time = datetime.utcnow() + timedelta(minutes=30)
    db.commit()

    from socket_manager import emit_pool_update
    members_count = db.query(PoolMember).filter(PoolMember.pool_id == pool.id).count()
    pool_data = {
        "poolId": str(pool.id),
        "crop": pool.crop.capitalize() if pool.crop else "",
        "location": pool.location,
        "currentQtyKg": pool.total_quantity,
        "targetQtyKg": float(pool.total_quantity),
        "farmersCount": members_count,
        "status": "auctioning",
        "currentHighestBid": discounted_reserve
    }
    emit_pool_update(str(pool.id), pool_data)


def notify_farmer_mini_auction(farmer):
    try:
        import requests
        import os
        voice_url = os.getenv("VOICE_LAYER_URL", "http://localhost:8000")
        msg = f"Mandi Mitra: A discounted mini-auction has been opened for your unsold crop pledge."
        requests.post(f"{voice_url}/notify", data={
            "phone_number": farmer.phone,
            "message": msg,
            "language": "hi-IN"
        }, timeout=5)
    except Exception:
        pass


def release_farmer(db, pool_id, phone):
    db.query(PoolMember).filter(
        PoolMember.pool_id == pool_id,
        PoolMember.farmer_phone == phone
    ).delete()
    db.commit()


def notify_farmer_released_bulbul(farmer):
    try:
        import requests
        import os
        voice_url = os.getenv("VOICE_LAYER_URL", "http://localhost:8000")
        msg = f"Mandi Mitra: Unfortunately your crop pledge could not be sold and has been released back to you."
        requests.post(f"{voice_url}/notify", data={
            "phone_number": farmer.phone,
            "message": msg,
            "language": "hi-IN"
        }, timeout=5)
    except Exception:
        pass


def allocate_pool(db, pool_id: int):
    # Farmers sorted by earliest pledge timestamp (first come first serve)
    farmers = get_farmers_sorted_by_pledge_time(db, pool_id)

    # Buyers sorted by highest bid price first
    bids = get_bids_sorted_by_price_desc(db, pool_id)

    # Track remaining quantity per farmer
    farmer_queue = [
        {"farmer": f, "remaining": f.quantity}
        for f in farmers
    ]
    farmer_index = 0
    allocations = []

    for bid in bids:
        if bid.buyer.suspended:
            continue

        buyer_remaining = bid.quantity

        # Fill this buyer from the farmer queue
        while buyer_remaining > 0 and farmer_index < len(farmer_queue):
            entry = farmer_queue[farmer_index]
            farmer = entry["farmer"]

            fill = min(entry["remaining"], buyer_remaining)

            allocations.append({
                "farmer_id": farmer.phone,
                "farmer_name": farmer.name,
                "farmer_phone": farmer.phone,
                "buyer_id": bid.buyer_id,
                "buyer_name": bid.buyer.name,
                "quantity": fill,
                "price_per_kg": bid.price_per_kg,
                "pool_id": pool_id
            })

            buyer_remaining -= fill
            entry["remaining"] -= fill

            # Update Offer allocated quantity
            bid.allocated_quantity += fill
            bid.status = "WON"

            # Farmer fully allocated, move to next farmer
            if entry["remaining"] == 0:
                farmer_index += 1

    # Set Offer status to LOST for bids with zero allocated quantity
    for offer in bids:
        if offer.allocated_quantity == 0:
            offer.status = "LOST"

    # Save all allocations and generate receipts
    # Note: one farmer may have multiple receipts at different prices
    # if their quantity was split across two buyers. This is correct.
    for alloc in allocations:
        save_allocation(db, alloc)
        # Generate receipt is handled by generating receipts for pool and get_receipt
        # Log for Bulbul confirmation call
        schedule_bulbul_confirmation(db, alloc)

    # Generate split / summary receipts
    from services.receipt_service import generate_receipts_for_pool
    generate_receipts_for_pool(db, pool_id)

    # Handle unsold farmers (remaining in queue after all buyers filled)
    unsold = farmer_queue[farmer_index:]
    # Also add partially unsold farmer if any remaining quantity
    if (farmer_index < len(farmer_queue) and
            farmer_queue[farmer_index]["remaining"] > 0):
        unsold_partial = farmer_queue[farmer_index]
        unsold.insert(0, unsold_partial)

    pool = db.query(Pool).filter(Pool.id == pool_id).first()
    if not pool:
        return {"error": "Pool not found"}

    MINI_AUCTION_THRESHOLD = 150.0

    if unsold:
        total_unsold_qty = sum(e["remaining"] for e in unsold)
        unsold_farmers = []
        for e in unsold:
            f_db = db.query(Farmer).filter(Farmer.phone == e["farmer"].phone).first()
            if f_db:
                f_db.quantity = e["remaining"]
                unsold_farmers.append(f_db)

        if total_unsold_qty >= MINI_AUCTION_THRESHOLD:
            # Enough quantity - open discounted mini auction
            open_mini_auction(
                db=db,
                pool_id=pool_id,
                quantity=total_unsold_qty,
                discount_rate=0.20,
                farmers=unsold_farmers
            )
            # Bulbul notifies these farmers of mini auction
            for farmer in unsold_farmers:
                notify_farmer_mini_auction(farmer)
        else:
            # Too little - release farmers back to unpooled
            for farmer in unsold_farmers:
                release_farmer(db, pool_id, farmer.phone)
                notify_farmer_released_bulbul(farmer)

    pool.status = "SETTLED"
    pool.closed_at = datetime.utcnow()
    
    # Calculate highest price from winning allocations
    winning_prices = [alloc["price_per_kg"] for alloc in allocations]
    pool.winning_price = max(winning_prices) if winning_prices else 0.0
    if bids:
        pool.winning_buyer_id = bids[0].buyer_id

    db.commit()

    # Generate PickupManifests for UI compatibility
    members = db.query(PoolMember).filter(PoolMember.pool_id == pool_id).all()
    farmer_contacts = ", ".join([m.farmer_phone for m in members])
    
    buyer_allocs = {}
    for alloc in allocations:
        b_id = alloc["buyer_id"]
        if b_id not in buyer_allocs:
            buyer_allocs[b_id] = {
                "name": alloc["buyer_name"],
                "qty": 0.0
            }
        buyer_allocs[b_id]["qty"] += alloc["quantity"]
        
    settlement_ids = []
    for b_id, b_info in buyer_allocs.items():
        manifest = PickupManifest(
            pool_id=pool_id,
            buyer_id=b_id,
            buyer_name=b_info["name"],
            allocated_quantity=b_info["qty"],
            farmer_contacts=farmer_contacts,
            pickup_location=pool.location
        )
        db.add(manifest)
        db.flush()
        settlement_ids.append(str(manifest.id))
        
    db.commit()

    from socket_manager import emit_pool_settled
    emit_pool_settled(
        pool_id=str(pool_id),
        winning_price_per_kg=pool.winning_price,
        settlement_ids=settlement_ids
    )

    return {
        "pool_id": pool_id,
        "status": "SETTLED",
        "allocations": [
            {
                "buyer_id": alloc["buyer_id"],
                "buyer_name": alloc["buyer_name"],
                "allocated_quantity": alloc["quantity"],
                "price": alloc["price_per_kg"]
            }
            for alloc in allocations
        ]
    }
