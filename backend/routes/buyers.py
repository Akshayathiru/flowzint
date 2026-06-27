from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from schemas import OfferCreate
from models import Buyer, Offer, Pool
from services.auction_service import (
    save_offer,
    get_best_offer,
    get_all_offers,
    get_all_buyers,
)

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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
def check_buyer_phone(
    phone: str,
    db: Session = Depends(get_db),
):
    """Check if a buyer with the given phone already exists."""
    buyer = db.query(Buyer).filter(Buyer.phone == phone).first()
    return {"phone": phone, "exists": buyer is not None}


@router.get("/buyers/{buyer_id}")
def get_buyer(
    buyer_id: int,
    db: Session = Depends(get_db),
):
    """Return a single buyer by ID."""
    buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    return {
        "buyer_id": buyer.id,
        "name": buyer.name,
        "phone": buyer.phone,
        "crop": buyer.crop,
        "location": buyer.location,
        "min_quantity": buyer.min_quantity,
    }


@router.put("/buyers/{buyer_id}")
def update_buyer(
    buyer_id: int,
    body: dict,
    db: Session = Depends(get_db),
):
    """Update a buyer's details."""
    buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    for key, val in body.items():
        if hasattr(buyer, key):
            setattr(buyer, key, val)
    db.commit()
    db.refresh(buyer)
    return {"buyer_id": buyer.id, "name": buyer.name, "phone": buyer.phone,
            "crop": buyer.crop, "location": buyer.location, "min_quantity": buyer.min_quantity}


@router.delete("/buyers/{buyer_id}")
def delete_buyer(
    buyer_id: int,
    db: Session = Depends(get_db),
):
    """Deactivate (delete) a buyer by ID."""
    buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    db.delete(buyer)
    db.commit()
    return {"id": buyer_id, "deactivated": True}


@router.get("/buyers/{buyer_id}/calls")
def buyer_calls(
    buyer_id: int,
    db: Session = Depends(get_db),
):
    """Return all offers/bids placed by this buyer across pools."""
    offers = db.query(Offer).filter(Offer.buyer_id == buyer_id).all()
    result = []
    for offer in offers:
        pool = db.query(Pool).filter(Pool.id == offer.pool_id).first()
        won = pool and pool.winning_buyer_id == buyer_id
        result.append({
            "poolId": str(offer.pool_id),
            "crop": pool.crop.capitalize() if pool and pool.crop else "",
            "district": pool.location if pool else "",
            "bid": offer.price,
            "result": "won" if won else ("no_answer" if not pool else "lost"),
            "lotQtyKg": pool.total_quantity if pool else 0,
        })
    return result