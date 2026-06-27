from models import Pool, PoolMember, Offer
from datetime import datetime

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

    if pool.total_quantity >= THRESHOLD:
        pool.status = "CLOSED"

    db.commit()

    return {
        "pool_id": pool.id,
        "crop": pool.crop,
        "location": pool.location,
        "total_quantity": pool.total_quantity,
        "status": pool.status
    }


def close_pool(db, pool_id):

    pool = db.query(Pool).filter(
        Pool.id == pool_id
    ).first()

    if pool is None:
        return {
            "message": "Pool not found"
        }

    best_offer = db.query(Offer).filter(
        Offer.pool_id == pool_id
    ).order_by(
        Offer.price.desc()
    ).first()

    if best_offer is None:
        return {
            "message": "No offers available"
        }

    pool.status = "CLOSED"

    pool.winning_price = best_offer.price
    pool.winning_buyer_id = best_offer.buyer_id
    pool.closed_at = datetime.now()

    db.commit()

    return {
        "pool_id": pool.id,
        "status": pool.status,
        "winning_price": pool.winning_price,
        "buyer_id": pool.winning_buyer_id
    }