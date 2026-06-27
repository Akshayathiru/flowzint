from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from schemas import FarmerConfirm
from services.confirmation_service import confirm_farmer

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/farmer_confirm")
def farmer_confirm(
    data: FarmerConfirm,
    db: Session = Depends(get_db)
):
    return confirm_farmer(db, data)