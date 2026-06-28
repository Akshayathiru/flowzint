from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from schemas import OfferCreate, BuyerCreate
from services.auction_service import (
    save_offer,
    get_best_offer,
    get_all_offers,
    get_all_buyers,
    create_buyer,
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