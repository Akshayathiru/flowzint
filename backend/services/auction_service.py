from models import Offer, Buyer, Pool


from datetime import datetime

from models import Offer, Buyer, Pool, PoolMember
from datetime import datetime, timedelta

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