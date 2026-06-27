from models import Pool, PoolMember, Buyer


def get_receipt(db, pool_id, phone):

    pool = db.query(Pool).filter(
        Pool.id == pool_id
    ).first()

    if pool is None:
        return {"message": "Pool not found"}

    member = db.query(PoolMember).filter(
        PoolMember.pool_id == pool_id,
        PoolMember.farmer_phone == phone
    ).first()

    if member is None:
        return {"message": "Farmer not found in this pool"}

    buyer = db.query(Buyer).filter(
        Buyer.id == pool.winning_buyer_id
    ).first()

    buyer_name = buyer.name if buyer else "Unknown"

    winning_price = pool.winning_price
    total_amount = member.quantity * winning_price if winning_price is not None else None

    return {
        "pool_id": pool.id,
        "crop": pool.crop,
        "location": pool.location,
        "farmer_phone": phone,
        "quantity": member.quantity,
        "price_per_kg": winning_price,
        "total_amount": total_amount,
        "buyer": buyer_name,
        "status": pool.status
    }