from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from schemas import FarmerCreate
from models import Farmer, PoolMember, Pool
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
