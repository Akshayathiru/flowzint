from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from schemas import OfferCreate
from services.auction_service import save_offer, get_best_offer

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
        db: Session = Depends(get_db)
):
    return save_offer(db, offer)


@router.get("/best_offer/{pool_id}")
def best_offer(
        pool_id: int,
        db: Session = Depends(get_db)
):
    return get_best_offer(db, pool_id)