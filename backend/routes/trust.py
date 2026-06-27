from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from schemas import TrustUpdate
from services.trust_service import update_trust_score, get_trust_score

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/update_trust")
def update_trust(
        trust: TrustUpdate,
        db: Session = Depends(get_db)
):
    return update_trust_score(db, trust)


@router.get("/trust_score/{phone}")
def trust_score(
        phone: str,
        db: Session = Depends(get_db)
):
    return get_trust_score(db, phone)