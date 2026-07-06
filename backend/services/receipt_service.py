import logging
from models import Pool, PoolMember, Buyer, Offer, Farmer, Allocation

logger = logging.getLogger(__name__)

def generate_receipts_for_pool(db, pool_id: int):
    # Retrieve all allocations for this pool
    allocations = db.query(Allocation).filter(Allocation.pool_id == pool_id).all()
    # Group by farmer_phone
    from collections import defaultdict
    farmer_allocs = defaultdict(list)
    for alloc in allocations:
        farmer_allocs[alloc.farmer_phone].append(alloc)
    
    # For each farmer, generate receipts
    for phone, allocs in farmer_allocs.items():
        farmer = db.query(Farmer).filter(Farmer.phone == phone).first()
        farmer_name = farmer.name if (farmer and farmer.name) else "Unknown Farmer"
        pool = db.query(Pool).filter(Pool.id == pool_id).first()
        crop = pool.crop.capitalize() if (pool and pool.crop) else "Crop"
        location = pool.location if pool else "Unknown Market"
        
        # 1. Generate individual receipt per allocation
        for alloc in allocs:
            receipt_text = (
                f"Crop: {crop}\n"
                f"Quantity: {alloc.quantity}kg\n"
                f"Buyer: {alloc.buyer_name}\n"
                f"Price: Rs{alloc.price_per_kg}/kg\n"
                f"Total: Rs{alloc.quantity * alloc.price_per_kg}\n"
                f"Pickup: {location} Market\n"
            )
            logger.info(f"Generated Individual Receipt for {farmer_name} ({phone}):\n{receipt_text}")
            
        # 2. If multiple allocations, generate one summary receipt
        if len(allocs) > 1:
            total_qty = sum(a.quantity for a in allocs)
            total_earned = sum(a.quantity * a.price_per_kg for a in allocs)
            weighted_avg_price = total_earned / total_qty if total_qty > 0 else 0.0
            
            breakdown_lines = []
            for a in allocs:
                breakdown_lines.append(f"    {a.quantity}kg @ Rs{a.price_per_kg} = Rs{a.quantity * a.price_per_kg} ({a.buyer_name})")
            
            breakdown_text = "\n".join(breakdown_lines)
            
            summary_text = (
                f"Crop: {crop}\n"
                f"Total Quantity Sold: {total_qty}kg\n"
                f"Breakdown:\n{breakdown_text}\n"
                f"Total Earned: Rs{total_earned}\n"
                f"Weighted Average Price: Rs{round(weighted_avg_price, 2)}/kg\n"
            )
            logger.info(f"Generated Summary Receipt for {farmer_name} ({phone}):\n{summary_text}")


def get_receipt(db, pool_id, phone):
    pool = db.query(Pool).filter(Pool.id == pool_id).first()
    if pool is None:
        return {"message": "Pool not found"}

    farmer = db.query(Farmer).filter(Farmer.phone == phone).first()
    farmer_name = farmer.name if (farmer and farmer.name) else "Unknown"

    allocations = db.query(Allocation).filter(
        Allocation.pool_id == pool_id,
        Allocation.farmer_phone == phone
    ).all()

    if not allocations:
        # Fallback to the old logic if no allocations saved yet (e.g. pool not settled or old mock data)
        member = db.query(PoolMember).filter(
            PoolMember.pool_id == pool_id,
            PoolMember.farmer_phone == phone
        ).first()
        if member is None:
            return {"message": "Farmer not found in this pool"}
            
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
                buyers.append(buyer.name)
            total_revenue += offer.allocated_quantity * offer.price
            total_sold += offer.allocated_quantity
            
        avg_price = total_revenue / total_sold if total_sold > 0 else 0.0
        total_amount = member.quantity * avg_price
        
        return {
            "pool_id": pool.id,
            "crop": pool.crop,
            "location": pool.location,
            "farmer_phone": phone,
            "farmer_name": farmer_name,
            "quantity": member.quantity,
            "average_price_per_kg": round(avg_price, 2),
            "total_amount": round(total_amount, 2),
            "buyers": ", ".join(buyers) if buyers else "Unknown",
            "status": pool.status,
            "receipts": [],
            "summary_receipt": None
        }

    # New logic using the saved Allocation entries
    total_qty = sum(a.quantity for a in allocations)
    total_amount = sum(a.quantity * a.price_per_kg for a in allocations)
    avg_price = total_amount / total_qty if total_qty > 0 else 0.0
    buyers = ", ".join(list(set(a.buyer_name for a in allocations)))
    
    # Build list of individual receipts
    individual_receipts = []
    for alloc in allocations:
        individual_receipts.append({
            "crop": pool.crop.capitalize() if pool.crop else "",
            "quantity": alloc.quantity,
            "buyer": alloc.buyer_name,
            "price": alloc.price_per_kg,
            "total": alloc.quantity * alloc.price_per_kg,
            "pickup": f"{pool.location} Market"
        })
        
    summary_receipt = None
    if len(allocations) > 1:
        breakdown = []
        for a in allocations:
            breakdown.append({
                "quantity": a.quantity,
                "price": a.price_per_kg,
                "total": a.quantity * a.price_per_kg,
                "buyer": a.buyer_name
            })
        summary_receipt = {
            "crop": pool.crop.capitalize() if pool.crop else "",
            "total_quantity_sold": total_qty,
            "breakdown": breakdown,
            "total_earned": total_amount,
            "weighted_average_price": round(avg_price, 2)
        }
        
    return {
        "pool_id": pool.id,
        "crop": pool.crop,
        "location": pool.location,
        "farmer_phone": phone,
        "farmer_name": farmer_name,
        "quantity": total_qty,
        "average_price_per_kg": round(avg_price, 2),
        "total_amount": round(total_amount, 2),
        "buyers": buyers,
        "status": pool.status,
        "receipts": individual_receipts,
        "summary_receipt": summary_receipt
    }