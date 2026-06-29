from models import Pool, PoolMember, Offer
from datetime import datetime, timedelta

THRESHOLD = 250


from socket_manager import emit_pool_new, emit_pool_update, emit_pool_settled

def add_farmer_to_pool(db, farmer):

    pool = db.query(Pool).filter(
        Pool.crop == farmer.crop,
        Pool.location == farmer.location,
        Pool.status == "OPEN"
    ).first()

    is_new = False
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
        is_new = True

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

    emit_pool_settled(
        pool_id=str(pool.id),
        winning_price_per_kg=best_offer.price,
        settlement_ids=[]
    )

    return {
        "pool_id": pool.id,
        "status": pool.status,
        "allocations": winning_buyers
    }