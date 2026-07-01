from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from schemas import OfferCreate, BuyerCreate, BuyerUpdate
from models import Buyer, Offer, Pool
from services.auction_service import (
    save_offer,
    get_best_offer,
    get_all_offers,
    get_all_buyers,
    create_buyer,
    update_buyer,
    delete_buyer,
)

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/add_buyer")
def add_buyer(
    buyer: BuyerCreate,
    db: Session = Depends(get_db)
):
    return create_buyer(db, buyer)


@router.post("/buyer_offer")
def buyer_offer(
    offer: OfferCreate,
    db: Session = Depends(get_db),
):
    return save_offer(db, offer)


@router.get("/best_offer/{pool_id}")
def best_offer(
    pool_id: int,
    db: Session = Depends(get_db),
):
    return get_best_offer(db, pool_id)


@router.get("/offers/{pool_id}")
def all_offers(
    pool_id: int,
    db: Session = Depends(get_db),
):
    return get_all_offers(db, pool_id)


@router.get("/buyers")
def buyers(
    db: Session = Depends(get_db),
):
    return get_all_buyers(db)


@router.get("/buyers/check")
def check_buyer(
    phone: str,
    db: Session = Depends(get_db)
):
    buyer = db.query(Buyer).filter(Buyer.phone == phone).first()
    return {"exists": buyer is not None}


@router.put("/buyers/{buyer_id}")
def update_buyer_route(
    buyer_id: int,
    buyer_data: BuyerUpdate,
    db: Session = Depends(get_db)
):
    return update_buyer(db, buyer_id, buyer_data)


@router.delete("/buyers/{buyer_id}")
def delete_buyer_route(
    buyer_id: int,
    db: Session = Depends(get_db)
):
    return delete_buyer(db, buyer_id)


@router.get("/buyers/{buyer_id}/calls")
@router.get("/buyers/{buyer_id}/call-history")
def get_buyer_calls(
    buyer_id: int,
    db: Session = Depends(get_db)
):
    offers = db.query(Offer).filter(Offer.buyer_id == buyer_id).all()
    res = []
    for offer in offers:
        pool = db.query(Pool).filter(Pool.id == offer.pool_id).first()
        res.append({
            "poolId": f"POOL-{offer.pool_id}" if pool else f"POOL-{offer.pool_id}",
            "date": offer.timestamp.strftime("%Y-%m-%d %H:%M") if offer.timestamp else "",
            "crop": pool.crop.capitalize() if pool and pool.crop else "",
            "district": pool.location if pool else "",
            "bid": offer.price,
            "result": "won" if offer.status == "WON" or offer.status == "DELIVERED" else "lost" if offer.status == "LOST" else "no_answer" if offer.status == "NO_SHOW" else "pending",
            "lotQtyKg": pool.total_quantity if pool else 0.0
        })
    return res
