from models import Offer


def save_offer(db, offer_data):

    offer = Offer(
        buyer_id=offer_data.buyer_id,
        pool_id=offer_data.pool_id,
        price=offer_data.price
    )

    db.add(offer)
    db.commit()

    return {
        "message": "Offer saved"
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