from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from services.receipt_service import get_receipt

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/receipt/{pool_id}/{phone}")
def receipt(
    pool_id: int,
    phone: str,
    db: Session = Depends(get_db)
):
    return get_receipt(db, pool_id, phone)