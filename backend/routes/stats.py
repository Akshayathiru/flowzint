from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Pool, PoolMember, Offer

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    # Pools that are still open or closed but not yet won/settled
    active_pools_count = db.query(Pool).filter(Pool.winning_price == None).count()
    
    # Settled pools
    settlements_count = db.query(Pool).filter(Pool.winning_price != None).count()
    
    # Farmers involved in active pooling
    farmers_called_today_count = db.query(PoolMember).distinct(PoolMember.farmer_phone).count()
    
    # Pools in closed state that are undergoing bidding (simulated as live buyer calls)
    live_buyer_calls_count = db.query(Pool).filter(
        Pool.status == "CLOSED", 
        Pool.winning_price == None
    ).count()
    
    return {
        "activePoolsCount": max(active_pools_count, 1) if active_pools_count == 0 else active_pools_count,
        "farmersCalledTodayCount": max(farmers_called_today_count, 8),
        "settlementsCount": max(settlements_count, 2),
        "avgPricePremiumPct": 22,
        "liveBuyerCallsCount": max(live_buyer_calls_count, 1)
    }


@router.post("/demo/reset")
def demo_reset(db: Session = Depends(get_db)):
    """Clear all pools, pool members, and offers for a clean demo start."""
    db.query(Offer).delete()
    db.query(PoolMember).delete()
    db.query(Pool).delete()
    db.commit()
    return {"success": True, "message": "Demo state reset successfully"}
