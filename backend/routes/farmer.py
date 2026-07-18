from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from schemas import FarmerCreate
from models import Farmer, PoolMember, Pool, Offer, Buyer
from services.pooling_engine import add_farmer_to_pool

router = APIRouter()


# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/add_farmer")
def add_farmer(farmer: FarmerCreate, db: Session = Depends(get_db)):
    result = add_farmer_to_pool(db, farmer)
    return result


@router.get("/farmers")
def list_farmers(db: Session = Depends(get_db)):
    """Return all unique farmers along with their pool memberships."""
    members = db.query(PoolMember).all()
    # Group by phone
    farmer_map = {}
    for m in members:
        if m.farmer_phone not in farmer_map:
            farmer = db.query(Farmer).filter(Farmer.phone == m.farmer_phone).first()
            farmer_map[m.farmer_phone] = {
                "phone": m.farmer_phone,
                "name": farmer.name if (farmer and farmer.name) else "Unknown",
                "trustScore": farmer.trust_score if farmer else 100,
                "successCount": farmer.success_count if farmer else 0,
                "noShowCount": farmer.no_show_count if farmer else 0,
                "pools": []
            }
        pool = db.query(Pool).filter(Pool.id == m.pool_id).first()
        farmer_map[m.farmer_phone]["pools"].append({
            "poolId": str(m.pool_id),
            "crop": pool.crop if pool else "",
            "quantity": m.quantity,
            "status": pool.status.lower() if pool else "unknown"
        })
    return list(farmer_map.values())


@router.get("/farmers/{phone}")
def get_farmer(phone: str, db: Session = Depends(get_db)):
    """Return a single farmer's profile by phone number."""
    farmer = db.query(Farmer).filter(Farmer.phone == phone).first()
    members = db.query(PoolMember).filter(PoolMember.farmer_phone == phone).all()
    pools = []
    for m in members:
        pool = db.query(Pool).filter(Pool.id == m.pool_id).first()
        pools.append({
            "poolId": str(m.pool_id),
            "crop": pool.crop if pool else "",
            "quantity": m.quantity,
            "status": pool.status.lower() if pool else "unknown"
        })
    return {
        "phone": phone,
        "name": farmer.name if (farmer and farmer.name) else "Unknown",
        "trustScore": farmer.trust_score if farmer else 100,
        "successCount": farmer.success_count if farmer else 0,
        "noShowCount": farmer.no_show_count if farmer else 0,
        "totalCalls": len(pools),
        "pools": pools,
    }



@router.get("/farmers/{phone}/settlements")
def get_farmer_settlements(phone: str, db: Session = Depends(get_db)):
    """Return settled pools where this farmer participated."""
    members = db.query(PoolMember).filter(PoolMember.farmer_phone == phone).all()
    result = []
    for m in members:
        pool = db.query(Pool).filter(Pool.id == m.pool_id, Pool.winning_price != None).first()
        if not pool:
            continue
        settled_date = pool.closed_at.strftime("%Y-%m-%d") if pool.closed_at else ""
        wp = float(str(pool.winning_price)) if pool.winning_price else 0.0
        mandi_rate = wp * 0.8
        premium_pct = round(((wp - mandi_rate) / mandi_rate * 100)) if mandi_rate else 0
        qty = float(str(m.quantity)) if m.quantity else 0.0
        result.append({
            "poolId": str(pool.id),
            "date": settled_date,
            "crop": pool.crop.capitalize() if pool.crop else "",
            "district": pool.location,
            "qtyKg": qty,
            "pricePerKg": wp,
            "totalEarnings": round(qty * wp, 2),
            "premiumPct": premium_pct,
            "phone": phone,
        })
    return result


@router.get("/farmer/{phone}")
def get_farmer_profile_v2(phone: str, db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter(Farmer.phone == phone).first()
    members = db.query(PoolMember).filter(PoolMember.farmer_phone == phone).all()
    
    total_quantity_kg = sum(m.quantity for m in members) if members else 0.0
    
    # Calculate total earnings from settled pools
    total_earnings = 0.0
    for m in members:
        pool = db.query(Pool).filter(Pool.id == m.pool_id, Pool.status == "SETTLED").first()
        if pool and pool.winning_price:
            total_earnings += m.quantity * pool.winning_price
            
    # Location and primary crop from first pool member, or defaults
    location = "Kanchipuram"
    primary_crop = "Tomato"
    member_since = "2026-07-10T00:00:00Z"
    
    if members:
        # Get location and crop from first pool
        first_pool = db.query(Pool).filter(Pool.id == members[0].pool_id).first()
        if first_pool:
            if first_pool.location:
                location = first_pool.location
            if first_pool.crop:
                primary_crop = first_pool.crop.capitalize()
            if first_pool.created_at:
                member_since = first_pool.created_at.isoformat() + "Z"

    db_trust = float(farmer.trust_score) if (farmer and farmer.trust_score is not None) else 100.0
    trust_score = round(db_trust / 20.0, 1)

    return {
        "phone": phone,
        "name": farmer.name if (farmer and farmer.name) else "Farmer",
        "location": location,
        "primary_crop": primary_crop,
        "trust_score": trust_score,
        "total_calls": len(members),
        "total_pools": len(members),
        "total_quantity_kg": total_quantity_kg,
        "total_earnings": round(float(total_earnings), 2),
        "member_since": member_since
    }


@router.get("/farmer/{phone}/pools")
def get_farmer_pools_v2(phone: str, db: Session = Depends(get_db)):
    members = db.query(PoolMember).filter(PoolMember.farmer_phone == phone).all()
    result = []
    for m in members:
        pool = db.query(Pool).filter(Pool.id == m.pool_id).first()
        if not pool:
            continue
        
        # Get count of other members in this pool
        pool_members_count = db.query(PoolMember).filter(PoolMember.pool_id == pool.id).count()
        
        status_mapped = "filling"
        if pool.status == "OPEN":
            status_mapped = "filling"
        elif pool.status == "AUCTION":
            status_mapped = "auctioning"
        elif pool.status == "CLOSED":
            status_mapped = "closed"
        elif pool.status == "SETTLED":
            status_mapped = "settled"
            
        wp = float(pool.winning_price) if pool.winning_price else None
        mandi_rate = wp * 0.8 if wp else None
        
        result.append({
            "pool_id": pool.id,
            "crop": pool.crop.capitalize() if pool.crop else "",
            "location": pool.location,
            "status": status_mapped,
            "current_qty_kg": pool.total_quantity,
            "target_qty_kg": 250.0,
            "farmers_count": pool_members_count,
            "your_contribution_kg": m.quantity,
            "settled_price_per_kg": wp,
            "mandi_rate_per_kg": mandi_rate
        })
    return result


@router.get("/farmer/{phone}/settlements")
def get_farmer_settlements_v2(phone: str, db: Session = Depends(get_db)):
    members = db.query(PoolMember).filter(PoolMember.farmer_phone == phone).all()
    result = []
    for m in members:
        pool = db.query(Pool).filter(Pool.id == m.pool_id, Pool.status == "SETTLED").first()
        if not pool:
            continue
        
        wp = float(pool.winning_price) if pool.winning_price else 0.0
        mandi_rate = float(wp * 0.8)
        premium_pct = round(float((wp - mandi_rate) / mandi_rate * 100)) if mandi_rate else 0
        qty = float(m.quantity) if m.quantity else 0.0
        
        # Find winning buyers
        winning_offers = db.query(Offer).filter(
            Offer.pool_id == pool.id,
            Offer.status.in_(["WON", "DELIVERED", "NO_SHOW"])
        ).all()
        
        buyers_info: list[str] = []
        for offer in winning_offers:
            buyer = db.query(Buyer).filter(Buyer.id == offer.buyer_id).first()
            if buyer and buyer.name:
                buyers_info.append(str(buyer.name))
        
        buyers_str = ", ".join(buyers_info) if buyers_info else "Unknown Buyer"
        settled_at_str = pool.closed_at.isoformat() + "Z" if pool.closed_at else ""
        
        result.append({
            "pool_id": pool.id,
            "crop": pool.crop.capitalize() if pool.crop else "",
            "location": pool.location,
            "your_quantity_kg": qty,
            "price_per_kg": wp,
            "mandi_rate_per_kg": mandi_rate,
            "total_amount": round(float(qty * wp), 2),
            "premium_percent": premium_pct,
            "buyers": buyers_str,
            "settled_at": settled_at_str
        })
    return result


@router.get("/farmer/{phone}/calls")
def get_farmer_calls_v2(phone: str, db: Session = Depends(get_db)):
    members = db.query(PoolMember).filter(PoolMember.farmer_phone == phone).all()
    result = []
    for m in members:
        pool = db.query(Pool).filter(Pool.id == m.pool_id).first()
        if not pool:
            continue
            
        timestamp = pool.created_at.isoformat() + "Z" if pool.created_at else datetime.now().isoformat() + "Z"
        
        result.append({
            "call_id": m.id,
            "timestamp": timestamp,
            "crop": pool.crop.capitalize() if pool.crop else "",
            "quantity_kg": m.quantity,
            "location": pool.location,
            "language": "Tamil",
            "pool_id": pool.id,
            "status": "connected"
        })
    return result


@router.get("/farmer/{phone}/status")
@router.get("/farmers/{phone}/status")
def get_farmer_status(phone: str, db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter(Farmer.phone == phone).first()
    member = db.query(PoolMember).filter(PoolMember.farmer_phone == phone).order_by(PoolMember.id.desc()).first()
    if not member:
        return {
            "farmer_name": farmer.name if (farmer and farmer.name) else "Farmer",
            "phone": phone,
            "status": "NO_POOL",
            "crop": "None",
            "quantity_kg": 0,
            "total_pool_qty_kg": 0,
            "target_qty_kg": 250.0,
            "winning_price": None,
            "location": "Market"
        }
    
    pool = db.query(Pool).filter(Pool.id == member.pool_id).first()
    return {
        "farmer_name": farmer.name if (farmer and farmer.name) else "Farmer",
        "phone": phone,
        "pool_id": pool.id if pool else member.pool_id,
        "status": pool.status if pool else "OPEN",
        "crop": pool.crop.capitalize() if (pool and pool.crop) else "Crop",
        "quantity_kg": member.quantity,
        "total_pool_qty_kg": pool.total_quantity if pool else member.quantity,
        "target_qty_kg": 250.0,
        "winning_price": pool.winning_price if (pool and pool.winning_price) else None,
        "location": pool.location if pool else "Market"
    }
