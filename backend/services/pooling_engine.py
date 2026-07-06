from models import Pool, PoolMember, Offer, Buyer, Farmer, PickupManifest
from datetime import datetime, timedelta, timezone
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
            created_at=datetime.now(timezone.utc),
            extended=False,
            current_highest_bid=0.0
        )
        db.add(pool)
        db.commit()
        db.refresh(pool)
        is_new = True

    # Ensure Farmer record exists and save name
    farmer_db = db.query(Farmer).filter(Farmer.phone == farmer.phone).first()
    if not farmer_db:
        farmer_db = Farmer(
            phone=farmer.phone,
            name=getattr(farmer, "name", None),
            trust_score=100,
            success_count=0,
            no_show_count=0,
            transaction_count=0
        )
        db.add(farmer_db)
        db.commit()
    else:
        if getattr(farmer, "name", None):
            farmer_db.name = farmer.name
            db.commit()

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
        pool.auction_start_time = datetime.now(timezone.utc)
        pool.auction_end_time = datetime.now(timezone.utc) + timedelta(minutes=30)

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
    from services.auction_service import allocate_pool
    return allocate_pool(db, pool_id)



def handle_pool_timeout(db, pool_id):
    pool = db.query(Pool).filter(Pool.id == pool_id).first()
    if not pool or pool.status != "OPEN":
        return {"message": "Pool not eligible for timeout processing"}

    if not pool.extended:
        # Auto-extend once
        pool.extended = True
        pool.created_at = datetime.now(timezone.utc)
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
        pool.auction_start_time = datetime.now(timezone.utc)
        pool.auction_end_time = datetime.now(timezone.utc) + timedelta(minutes=30)
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