from models import Farmer, Buyer, PoolMember, Offer, TrustScore
from fastapi import HTTPException

def adjust_trust_score(db, entity, delivered: bool, pledged_qty: float, delivered_qty: float):
    """
    Adjusts trust score and transaction count for either a Farmer or a Buyer.
    """
    entity.transaction_count = (entity.transaction_count or 0) + 1

    if delivered:
        # Confirmed Delivery: standard gain is +5
        gain = 5
        # Cap score gain from any single small transaction (< 50 kg)
        if pledged_qty < 50.0:
            gain = 2
        entity.trust_score = min(100, (entity.trust_score or 100) + gain)
        
        if hasattr(entity, "success_count"):
            entity.success_count = (entity.success_count or 0) + 1
    else:
        # No-Show: penalties scale with the proportion of total pledged quantity that was no-showed
        no_show_qty = max(0.0, pledged_qty - delivered_qty)
        proportion = (no_show_qty / pledged_qty) if pledged_qty > 0 else 1.0
        penalty = round(20 * proportion)
        entity.trust_score = max(0, (entity.trust_score or 100) - penalty)
        
        if hasattr(entity, "no_show_count"):
            entity.no_show_count = (entity.no_show_count or 0) + 1
            # Auto-suspend buyer if no-shows >= 3
            if hasattr(entity, "suspended") and entity.no_show_count >= 3:
                entity.suspended = True


def confirm_delivery(db, data):
    """
    Marks a settled allocation as delivered or no-show, triggering trust adjustments.
    """
    pool_id = data.pool_id
    phone = data.phone
    entity_type = data.entity_type.lower()
    delivered = data.delivered
    delivered_qty = data.delivered_qty if data.delivered_qty is not None else 0.0

    if entity_type == "farmer":
        # 1. Fetch PoolMember
        member = db.query(PoolMember).filter(
            PoolMember.pool_id == pool_id,
            PoolMember.farmer_phone == phone
        ).first()
        if not member:
            raise HTTPException(status_code=404, detail="Farmer not found in this pool")
        
        # 2. Update PoolMember status
        member.delivered = "YES" if delivered else "NO"
        if data.crop_quality_grade:
            member.crop_quality_grade = data.crop_quality_grade
            
        pledged_qty = member.quantity
        if delivered:
            delivered_qty = pledged_qty  # Fully delivered if marked true and no custom quantity

        # 3. Fetch/Create Farmer
        farmer = db.query(Farmer).filter(Farmer.phone == phone).first()
        if not farmer:
            farmer = Farmer(phone=phone, trust_score=100, success_count=0, no_show_count=0, transaction_count=0)
            db.add(farmer)

        # 4. Adjust trust score
        adjust_trust_score(db, farmer, delivered, pledged_qty, delivered_qty)

        # 5. Factor in crop quality grade if present
        # Grade scale: A/B/C or 1-5
        grade = member.crop_quality_grade
        if grade:
            grade_upper = grade.upper()
            if grade_upper in ["A", "5", "4"]:
                farmer.trust_score = min(100, farmer.trust_score + 2)
            elif grade_upper in ["C", "1", "2"]:
                farmer.trust_score = max(0, farmer.trust_score - 5)

        db.commit()
        return {
            "message": "Farmer delivery confirmation processed",
            "phone": phone,
            "trustScore": farmer.trust_score,
            "transactionCount": farmer.transaction_count,
            "delivered": member.delivered
        }

    elif entity_type == "buyer":
        # 1. Fetch Buyer
        buyer = db.query(Buyer).filter(Buyer.phone == phone).first()
        if not buyer:
            raise HTTPException(status_code=404, detail="Buyer not found")

        # 2. Fetch Offer won on pool
        offer = db.query(Offer).filter(
            Offer.pool_id == pool_id,
            Offer.buyer_id == buyer.id,
            Offer.status == "WON"
        ).first()
        if not offer:
            raise HTTPException(status_code=404, detail="No winning offer found for this buyer on this pool")

        # 3. Update Offer status
        offer.status = "DELIVERED" if delivered else "NO_SHOW"
        
        pledged_qty = offer.allocated_quantity
        if delivered:
            delivered_qty = pledged_qty

        # 4. Adjust trust score
        adjust_trust_score(db, buyer, delivered, pledged_qty, delivered_qty)
        
        db.commit()
        return {
            "message": "Buyer pickup confirmation processed",
            "phone": phone,
            "trustScore": buyer.trust_score,
            "transactionCount": buyer.transaction_count,
            "suspended": buyer.suspended,
            "status": offer.status
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid entity_type. Must be 'farmer' or 'buyer'")


def update_trust_score(db, trust_data):
    """Backwards compatibility for simple trust updates."""
    farmer = db.query(Farmer).filter(Farmer.phone == trust_data.phone).first()
    if not farmer:
        farmer = Farmer(phone=trust_data.phone, trust_score=100)
        db.add(farmer)
        
    adjust_trust_score(db, farmer, trust_data.delivered, 50.0, 50.0 if trust_data.delivered else 0.0)
    db.commit()
    return {
        "phone": farmer.phone,
        "score": farmer.trust_score
    }


def get_trust_score(db, phone):
    """Retrieve trust details for either farmer or buyer."""
    # Check Farmer first
    farmer = db.query(Farmer).filter(Farmer.phone == phone).first()
    if farmer:
        return {
            "phone": phone,
            "score": farmer.trust_score,
            "transaction_count": farmer.transaction_count
        }
    
    # Check Buyer next
    buyer = db.query(Buyer).filter(Buyer.phone == phone).first()
    if buyer:
        return {
            "phone": phone,
            "score": buyer.trust_score,
            "transaction_count": buyer.transaction_count,
            "suspended": buyer.suspended
        }

    # Default fallback
    return {
        "phone": phone,
        "score": 100,
        "transaction_count": 0
    }