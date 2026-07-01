from models import Pool, PoolMember, Buyer, Offer

# TODO: Integrate real payment/escrow rails (Phase 2 implementation)
def get_receipt(db, pool_id, phone):
    pool = db.query(Pool).filter(Pool.id == pool_id).first()

    if pool is None:
        return {"message": "Pool not found"}

    member = db.query(PoolMember).filter(
        PoolMember.pool_id == pool_id,
        PoolMember.farmer_phone == phone
    ).first()

    if member is None:
        return {"message": "Farmer not found in this pool"}

    # Fetch all winning bids for this pool
    winning_offers = db.query(Offer).filter(
        Offer.pool_id == pool_id,
        Offer.status == "WON"
    ).all()

    buyers = []
    total_revenue = 0.0
    total_sold = 0.0

    for offer in winning_offers:
        buyer = db.query(Buyer).filter(Buyer.id == offer.buyer_id).first()
        if buyer:
            buyers.append(f"{buyer.name}")
        total_revenue += offer.allocated_quantity * offer.price
        total_sold += offer.allocated_quantity

    avg_price_per_kg = (total_revenue / total_sold) if total_sold > 0 else 0.0
    total_farmer_amount = member.quantity * avg_price_per_kg if avg_price_per_kg > 0 else 0.0

    return {
        "pool_id": pool.id,
        "crop": pool.crop,
        "location": pool.location,
        "farmer_phone": phone,
        "quantity": member.quantity,
        "average_price_per_kg": round(avg_price_per_kg, 2),
        "total_amount": round(total_farmer_amount, 2),
        "buyers": ", ".join(buyers) if buyers else "Unknown",
        "status": pool.status
    }