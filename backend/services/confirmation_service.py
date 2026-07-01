from models import FarmerConfirmation, Farmer, PoolMember, Pool
from services.pooling_engine import close_pool

def confirm_farmer(db, data):
    # Log the confirmation
    confirmation = FarmerConfirmation(
        pool_id=data.pool_id,
        phone=data.phone,
        accepted="YES" if data.accepted else "NO"
    )
    db.add(confirmation)
    
    # Update Trust Score
    farmer = db.query(Farmer).filter(Farmer.phone == data.phone).first()
    if not farmer:
        farmer = Farmer(phone=data.phone, trust_score=100)
        db.add(farmer)
        
    pool_member = db.query(PoolMember).filter(
        PoolMember.pool_id == data.pool_id,
        PoolMember.farmer_phone == data.phone
    ).first()

    if pool_member and getattr(data, "crop_quality_grade", None) is not None:
        pool_member.crop_quality_grade = data.crop_quality_grade


    if data.accepted:
        farmer.trust_score = min(100, farmer.trust_score + 5)
        farmer.success_count += 1
    else:
        farmer.trust_score = max(0, farmer.trust_score - 10)
        farmer.no_show_count += 1
        
        if pool_member:
            # Deduct rejected quantity from pool
            pool = db.query(Pool).filter(Pool.id == data.pool_id).first()
            if pool:
                pool.total_quantity = max(0, pool.total_quantity - pool_member.quantity)
                # Re-run allocation engine to adjust buyer allocations
                db.commit()
                close_pool(db, data.pool_id)
            
            # Remove the farmer from this pool
            db.delete(pool_member)

    db.commit()

    return {
        "message": "Farmer confirmation saved",
        "accepted": data.accepted
    }