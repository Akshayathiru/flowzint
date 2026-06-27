from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Pool, PoolMember, Buyer
from services.pooling_engine import close_pool
from services.pools_service import get_pool_summary

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/active")
def get_active_pools(db: Session = Depends(get_db)):
    # Retrieve pools that are OPEN or CLOSED (active) and not yet won/settled
    pools = db.query(Pool).filter(
        Pool.status.in_(["OPEN", "CLOSED"]),
        Pool.winning_price == None
    ).all()
    
    result = []
    for pool in pools:
        members = db.query(PoolMember).filter(PoolMember.pool_id == pool.id).all()
        farmers_count = len(members)
        
        # Determine geoCenter coordinates
        geo = [12.8342, 79.7036] # default Kanchipuram
        if "vellore" in pool.location.lower():
            geo = [12.9165, 79.1325]
        elif "salem" in pool.location.lower():
            geo = [11.6643, 78.1460]
        elif "krishnagiri" in pool.location.lower():
            geo = [12.5186, 78.2138]
        elif "chengalpattu" in pool.location.lower():
            geo = [12.6841, 79.9836]
        elif "tiruvannamalai" in pool.location.lower():
            geo = [12.2280, 79.0667]

        result.append({
            "poolId": str(pool.id),
            "crop": pool.crop.capitalize() if pool.crop else "",
            "location": pool.location,
            "currentQtyKg": pool.total_quantity,
            "targetQtyKg": 250.0,  # threshold quantity
            "farmersCount": farmers_count,
            "minutesRemaining": 45 if pool.status == "OPEN" else 0,
            "status": "filling" if pool.status == "OPEN" else "auctioning",
            "geoCenter": geo
        })
    return result


@router.get("/settlements")
def get_settlements(db: Session = Depends(get_db)):
    """Return settled pools (winning_price is set)."""
    pools = db.query(Pool).filter(Pool.winning_price != None).all()
    result = []
    for pool in pools:
        members = db.query(PoolMember).filter(PoolMember.pool_id == pool.id).all()
        buyer = db.query(Buyer).filter(Buyer.id == pool.winning_buyer_id).first()
        total_qty = sum(m.quantity for m in members)
        result.append({
            "poolId": str(pool.id),
            "crop": pool.crop.capitalize() if pool.crop else "",
            "location": pool.location,
            "totalQtyKg": total_qty,
            "farmersCount": len(members),
            "winningPricePerKg": pool.winning_price,
            "buyerName": buyer.name if buyer else "Unknown",
            "settledAt": pool.closed_at.isoformat() if pool.closed_at else None,
            "status": "settled"
        })
    return result


@router.get("/pools/{pool_id}")
def get_pool_by_id(pool_id: int, db: Session = Depends(get_db)):
    """Return a single pool's detail by ID."""
    pool = db.query(Pool).filter(Pool.id == pool_id).first()
    if pool is None:
        return {"error": "Pool not found"}
    members = db.query(PoolMember).filter(PoolMember.pool_id == pool_id).all()
    buyer = db.query(Buyer).filter(Buyer.id == pool.winning_buyer_id).first()
    geo = [12.8342, 79.7036]
    if pool.location:
        loc = pool.location.lower()
        if "vellore" in loc:
            geo = [12.9165, 79.1325]
        elif "salem" in loc:
            geo = [11.6643, 78.1460]
        elif "krishnagiri" in loc:
            geo = [12.5186, 78.2138]
        elif "chengalpattu" in loc:
            geo = [12.6841, 79.9836]
        elif "tiruvannamalai" in loc:
            geo = [12.2280, 79.0667]
    return {
        "poolId": str(pool.id),
        "crop": pool.crop.capitalize() if pool.crop else "",
        "location": pool.location,
        "currentQtyKg": pool.total_quantity,
        "targetQtyKg": 250.0,
        "farmersCount": len(members),
        "status": pool.status.lower(),
        "winningPricePerKg": pool.winning_price,
        "buyerName": buyer.name if buyer else None,
        "settledAt": pool.closed_at.isoformat() if pool.closed_at else None,
        "geoCenter": geo
    }


@router.post("/close_pool/{pool_id}")
def close_pool_route(
    pool_id: int,
    db: Session = Depends(get_db)
):
    return close_pool(db, pool_id)


@router.get("/pool_summary/{pool_id}")
def pool_summary(
    pool_id: int,
    db: Session = Depends(get_db)
):
    return get_pool_summary(db, pool_id)