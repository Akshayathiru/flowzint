from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from schemas import FarmerCreate
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