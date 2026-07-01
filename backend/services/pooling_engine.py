from models import Pool, PoolMember, Offer, Buyer, Farmer, PickupManifest
from datetime import datetime, timedelta
from fastapi import HTTPException

THRESHOLD = 250

CROP_SYNONYMS = {
    "tomato": "tomato",
    "tomatoes": "tomato",
    "tamatar": "tomato",
    "thakkali": "tomato",
    "தக்காளி": "tomato",
    "టమోటా": "tomato",
    "onion": "onion",
    "onions": "onion",
    "pyaaz": "onion",
    "vengayam": "onion",
    "வெங்காயம்": "onion",
    "ఉల్లిపాయ": "onion",
    "rice": "rice",
    "chawal": "rice",
    "arisi": "rice",
    "அரிసి": "rice",
    "వరి": "rice",
    "potato": "potato",
    "potatoes": "potato",
    "aloo": "potato",
    "urulaikilangu": "potato",
    "உருளைக்கிழங்கு": "potato",
    "బంగాళాదుంప": "potato",
    "chilli": "chilli",
    "chillies": "chilli",
    "mirchi": "chilli",
    "மிளகாய்": "chilli",
    "మిరపకాయ": "chilli",
    "brinjal": "brinjal",
    "kathirikai": "brinjal",
    "கத்தரிக்காய்": "brinjal",
    "వంకాయ": "brinjal",
}

VALID_LOCATIONS = ["krishnagiri", "chittoor", "nashik", "pune", "bangalore", "kanchipuram", "vellore", "salem", "chengalpattu", "tiruvannamalai"]

from socket_manager import emit_pool_new, emit_pool_update, emit_pool_settled

def normalize_crop(crop: str) -> str:
    if not crop:
        return ""
    crop_clean = crop.lower().strip()
    return CROP_SYNONYMS.get(crop_clean, crop_clean)

def normalize_location(location: str) -> str:
    if not location:
        raise HTTPException(status_code=400, detail="Location cannot be empty")
    loc_clean = location.lower().strip()
    if loc_clean in VALID_LOCATIONS:
        return loc_clean
    for loc in VALID_LOCATIONS:
        if loc in loc_clean or loc_clean in loc:
            return loc
    raise HTTPException(
        status_code=400,
        detail=f"Location '{location}' is not recognized. Must be one of: {', '.join(VALID_LOCATIONS)}"
    )

def add_farmer_to_pool(db, farmer):
    # Normalize inputs
    norm_crop = normalize_crop(farmer.crop)
    norm_loc = normalize_location(farmer.location)

    # Active pledge check: only one active unsettled pledge per crop at a time
    active_pledge = db.query(PoolMember).join(Pool).filter(
        PoolMember.farmer_phone == farmer.phone,
        Pool.crop == norm_crop,
        Pool.status.in_(["OPEN", "PARTIAL_CLOSE", "AUCTION", "CLOSED"])
    ).first()
    if active_pledge:
        raise HTTPException(
            status_code=400, 
            detail=f"Farmer already has an active, unsettled pledge for crop '{norm_crop}' in pool {active_pledge.pool_id}"
        )

    # Use row-level locking / transaction locking to avoid duplicate open pool creation
    pool = db.query(Pool).filter(
        Pool.crop == norm_crop,
        Pool.location == norm_loc,
        Pool.status == "OPEN"
    ).with_for_update().first()

    is_new = False
    if pool is None:
        pool = Pool(
            crop=norm_crop,
            location=norm_loc,
            total_quantity=0,
            status="OPEN",
            created_at=datetime.utcnow(),
            extended=False,
            current_highest_bid=0.0
        )
        db.add(pool)
        db.commit()
        db.refresh(pool)
        is_new = True

    member = PoolMember(
        pool_id=pool.id,
        farmer_phone=farmer.phone,
        quantity=farmer.quantity,
        delivered="PENDING"
    )
    db.add(member)

    pool.total_quantity += farmer.quantity

    if pool.total_quantity >= THRESHOLD and pool.status == "OPEN":
        pool.status = "AUCTION"
        pool.auction_start_time = datetime.utcnow()
        pool.auction_end_time = datetime.utcnow() + timedelta(minutes=30)

    db.commit()

    pool_data = {
        "poolId": str(pool.id),
        "crop": pool.crop.capitalize() if pool.crop else "",
        "location": pool.location,
        "currentQtyKg": pool.total_quantity,
        "targetQtyKg": float(THRESHOLD),
        "farmersCount": db.query(PoolMember).filter(PoolMember.pool_id == pool.id).count(),
        "status": "filling" if pool.status == "OPEN" else "auctioning"
    }

    if is_new:
        emit_pool_new(pool_data)
    else:
        emit_pool_update(pool_id=str(pool.id), pool_data=pool_data)

    return {
        "pool_id": pool.id,
        "crop": pool.crop,
        "location": pool.location,
        "total_quantity": pool.total_quantity,
        "status": pool.status
    }


def close_pool(db, pool_id):
    pool = db.query(Pool).filter(Pool.id == pool_id).first()

    if pool is None:
        return {"message": "Pool not found"}

    # Sort by Offer.price DESC, then Offer.timestamp ASC (earliest bid wins tie-breaker)
    offers = db.query(Offer).filter(
        Offer.pool_id == pool_id
    ).order_by(
        Offer.price.desc(),
        Offer.timestamp.asc()
    ).all()

    if not offers:
        pool.status = "CLOSED"
        pool.closed_at = datetime.utcnow()
        db.commit()
        emit_pool_settled(str(pool.id), 0.0, [])
        return {"message": "No offers available"}

    remaining_qty = pool.total_quantity
    winning_buyers = []
    best_winning_price = 0.0

    for offer in offers:
        if remaining_qty <= 0:
            offer.status = "LOST"
            offer.allocated_quantity = 0.0
            continue
        
        # Allocate quantity to this buyer
        allocated = min(remaining_qty, offer.quantity)
        offer.allocated_quantity = allocated
        offer.status = "WON"
        remaining_qty -= allocated
        
        if offer.price > best_winning_price:
            best_winning_price = offer.price

        buyer = db.query(Buyer).filter(Buyer.id == offer.buyer_id).first()
        buyer_name = buyer.name if buyer else "Unknown"
        
        winning_buyers.append({
            "buyer_id": offer.buyer_id,
            "buyer_name": buyer_name,
            "allocated_quantity": allocated,
            "price": offer.price
        })

    pool.status = "SETTLED"
    pool.closed_at = datetime.utcnow()
    pool.winning_price = best_winning_price
    
    # Record highest bid buyer ID
    if offers:
        pool.winning_buyer_id = offers[0].buyer_id

    # Generate PickupManifest
    members = db.query(PoolMember).filter(PoolMember.pool_id == pool.id).all()
    farmer_contacts = ", ".join([m.farmer_phone for m in members])
    
    settlement_ids = []
    for win in winning_buyers:
        manifest = PickupManifest(
            pool_id=pool.id,
            buyer_id=win["buyer_id"],
            buyer_name=win["buyer_name"],
            allocated_quantity=win["allocated_quantity"],
            farmer_contacts=farmer_contacts,
            pickup_location=pool.location
        )
        db.add(manifest)
        db.flush()
        settlement_ids.append(str(manifest.id))
        
        # Trigger outbound farmer confirmation call (Phase 2 Stub)
        for m in members:
            try:
                import sys
                import os
                import asyncio
                root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
                if root_path not in sys.path:
                    sys.path.append(root_path)
                from callback_service import call_farmer_for_confirmation
                
                coro = call_farmer_for_confirmation(
                    farmer_phone=m.farmer_phone,
                    buyer_name=win["buyer_name"],
                    crop=pool.crop,
                    price_per_kg=win["price"],
                    quantity_kg=m.quantity
                )
                try:
                    loop = asyncio.get_running_loop()
                    loop.create_task(coro)
                except RuntimeError:
                    asyncio.run(coro)
            except Exception as e:
                logger.error(f"Error calling farmer confirmation stub: {e}")

    db.commit()

    emit_pool_settled(
        pool_id=str(pool.id),
        winning_price_per_kg=best_winning_price,
        settlement_ids=settlement_ids
    )

    return {
        "pool_id": pool.id,
        "status": pool.status,
        "allocations": winning_buyers
    }


def handle_pool_timeout(db, pool_id):
    pool = db.query(Pool).filter(Pool.id == pool_id).first()
    if not pool or pool.status != "OPEN":
        return {"message": "Pool not eligible for timeout processing"}

    if not pool.extended:
        # Auto-extend once
        pool.extended = True
        pool.created_at = datetime.utcnow()
        db.commit()

        # Notify pooled farmers
        members = db.query(PoolMember).filter(PoolMember.pool_id == pool.id).all()
        for m in members:
            try:
                import requests
                import os
                voice_url = os.getenv("VOICE_LAYER_URL", "http://localhost:8000")
                msg = f"Mandi Mitra: Your pool for {pool.crop} in {pool.location} did not reach capacity and has been extended for 48 hours."
                requests.post(f"{voice_url}/notify", data={
                    "phone_number": m.farmer_phone,
                    "message": msg,
                    "language": "hi-IN"
                }, timeout=5)
            except Exception as e:
                pass

        pool_data = {
            "poolId": str(pool.id),
            "crop": pool.crop.capitalize() if pool.crop else "",
            "location": pool.location,
            "currentQtyKg": pool.total_quantity,
            "targetQtyKg": float(THRESHOLD),
            "farmersCount": len(members),
            "status": "filling"
        }
        emit_pool_update(str(pool.id), pool_data)
        return {"message": "Pool extended", "pool_id": pool.id}
    else:
        # Transition to PARTIAL_CLOSE and immediately launch a mini-auction at 20% discount
        pool.status = "PARTIAL_CLOSE"
        db.commit()

        from services.mandi_service import get_mandi_price
        mandi_info = get_mandi_price(pool.crop, pool.location)
        mandi_price = mandi_info.get("mandi_price", 15.0) if mandi_info else 15.0
        discounted_reserve = round(mandi_price * 0.8, 2)

        pool.status = "AUCTION"
        pool.current_highest_bid = discounted_reserve
        pool.auction_start_time = datetime.utcnow()
        pool.auction_end_time = datetime.utcnow() + timedelta(minutes=30)
        db.commit()

        members_count = db.query(PoolMember).filter(PoolMember.pool_id == pool.id).count()
        pool_data = {
            "poolId": str(pool.id),
            "crop": pool.crop.capitalize() if pool.crop else "",
            "location": pool.location,
            "currentQtyKg": pool.total_quantity,
            "targetQtyKg": float(THRESHOLD),
            "farmersCount": members_count,
            "status": "auctioning",
            "currentHighestBid": discounted_reserve
        }
        emit_pool_update(str(pool.id), pool_data)
        return {"message": "Pool transitioned to mini-auction", "pool_id": pool.id, "reserve_price": discounted_reserve}