from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Pool, PoolMember, Buyer, Offer
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
    pools = db.query(Pool).filter(Pool.status.in_(["OPEN", "CLOSED"])).all()
    result = []
    for pool in pools:
        members = db.query(PoolMember).filter(PoolMember.pool_id == pool.id).all()
        result.append({
            "poolId": str(pool.id),
            "crop": pool.crop.capitalize() if pool.crop else "",
            "location": pool.location,
            "currentQtyKg": pool.total_quantity,
            "targetQtyKg": 250.0,
            "farmersCount": len(members),
            "status": "filling" if pool.status == "OPEN" else "auctioning"
        })
    return result

@router.get("/settlements")
def get_settlements(db: Session = Depends(get_db)):
    pools = db.query(Pool).filter(Pool.status == "SETTLED").all()
    result = []
    for pool in pools:
        members = db.query(PoolMember).filter(PoolMember.pool_id == pool.id).all()
        
        # Get winning buyers from Offers
        winning_offers = db.query(Offer).filter(
            Offer.pool_id == pool.id,
            Offer.status == "WON"
        ).all()
        
        buyers_info = []
        avg_price = 0
        if winning_offers:
            avg_price = sum([o.price for o in winning_offers]) / len(winning_offers)
            for offer in winning_offers:
                buyer = db.query(Buyer).filter(Buyer.id == offer.buyer_id).first()
                if buyer:
                    buyers_info.append(f"{buyer.name} ({offer.allocated_quantity}kg)")
                    
        total_qty = sum(m.quantity for m in members)
        result.append({
            "poolId": str(pool.id),
            "crop": pool.crop.capitalize() if pool.crop else "",
            "location": pool.location,
            "totalQtyKg": total_qty,
            "farmersCount": len(members),
            "winningPricePerKg": avg_price,
            "buyerName": ", ".join(buyers_info) if buyers_info else "Unknown",
            "settledAt": pool.closed_at.isoformat() if pool.closed_at else None,
            "status": "settled"
        })
    return result

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