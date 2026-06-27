from models import Pool, Buyer


def get_pool_summary(db, pool_id):

    pool = db.query(Pool).filter(
        Pool.id == pool_id
    ).first()

    if pool is None:
        return {
            "message": "Pool not found"
        }

    buyer_name = None

    if pool.winning_buyer_id:

        buyer = db.query(Buyer).filter(
            Buyer.id == pool.winning_buyer_id
        ).first()

        if buyer:
            buyer_name = buyer.name

    return {

        "pool_id": pool.id,

        "crop": pool.crop,

        "location": pool.location,

        "total_quantity": pool.total_quantity,

        "status": pool.status,

        "winning_price": pool.winning_price,

        "buyer_name": buyer_name

    }