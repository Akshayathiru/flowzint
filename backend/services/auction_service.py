from models import Offer, Buyer


def save_offer(db, offer_data):
    offer = Offer(
        buyer_id=offer_data.buyer_id,
        pool_id=offer_data.pool_id,
        price=offer_data.price
    )

    db.add(offer)
    db.commit()

    buyer = db.query(Buyer).filter(Buyer.id == offer_data.buyer_id).first()
    buyer_name = buyer.name if buyer else "Unknown"

    from socket_manager import emit_pool_bid
    emit_pool_bid(str(offer_data.pool_id), buyer_name, offer_data.price)

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