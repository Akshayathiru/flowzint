from models import Pool, PoolMember, Offer
from datetime import datetime, timedelta

THRESHOLD = 250


def add_farmer_to_pool(db, farmer):

    pool = db.query(Pool).filter(
        Pool.crop == farmer.crop,
        Pool.location == farmer.location,
        Pool.status == "OPEN"
    ).first()

    if pool is None:

        pool = Pool(
            crop=farmer.crop,
            location=farmer.location,
            total_quantity=0,
            status="OPEN"
        )

        db.add(pool)
        db.commit()
        db.refresh(pool)

    member = PoolMember(
        pool_id=pool.id,
        farmer_phone=farmer.phone,
        quantity=farmer.quantity
    )

    db.add(member)

    pool.total_quantity += farmer.quantity

    if pool.total_quantity >= THRESHOLD and pool.status == "OPEN":
        pool.status = "CLOSED"
        pool.auction_start_time = datetime.utcnow()
        pool.auction_end_time = datetime.utcnow() + timedelta(minutes=30)

    db.commit()

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

    offers = db.query(Offer).filter(
        Offer.pool_id == pool_id
    ).order_by(
        Offer.price.desc()
    ).all()

    if not offers:
        return {"message": "No offers available"}

    remaining_qty = pool.total_quantity
    winning_buyers = []

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
        
        winning_buyers.append({
            "buyer_id": offer.buyer_id,
            "allocated_quantity": allocated,
            "price": offer.price
        })

    pool.status = "SETTLED"
    pool.closed_at = datetime.utcnow()

    db.commit()

    return {
        "pool_id": pool.id,
        "status": pool.status,
        "allocations": winning_buyers
    }