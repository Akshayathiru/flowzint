from models import Pool, PoolMember

THRESHOLD = 250


def add_farmer_to_pool(db, farmer):

    # Find open pool
    pool = db.query(Pool).filter(
        Pool.crop == farmer.crop,
        Pool.location == farmer.location,
        Pool.status == "OPEN"
    ).first()

    # Create pool if none exists
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

    # Add farmer to pool
    member = PoolMember(
        pool_id=pool.id,
        farmer_phone=farmer.phone,
        quantity=farmer.quantity
    )

    db.add(member)

    # Increase total quantity
    pool.total_quantity += farmer.quantity

    # Close pool if threshold reached
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