from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from schemas import TrustUpdate, DeliveryConfirm
from services.trust_service import update_trust_score, get_trust_score, confirm_delivery
from models import Farmer, PoolMember

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


@router.post("/delivery_confirm")
def delivery_confirm_route(
    data: DeliveryConfirm,
    db: Session = Depends(get_db)
):
    return confirm_delivery(db, data)


@router.get("/farmers/{phone}/trust-score")
def get_farmer_trust_score_detailed(
    phone: str,
    db: Session = Depends(get_db)
):
    farmer = db.query(Farmer).filter(Farmer.phone == phone).first()
    members = db.query(PoolMember).filter(PoolMember.farmer_phone == phone).all()
    
    score = farmer.trust_score if farmer else 100
    transaction_count = farmer.transaction_count if farmer else 0
    
    quality_grades = [m.crop_quality_grade for m in members if m.crop_quality_grade]
    
    recent_events = []
    for m in members:
        if m.delivered == "YES":
            val = 2 if (m.quantity or 0) < 50.0 else 5
            recent_events.append(f"+{val} (Delivery on Pool {m.pool_id})")
            if m.crop_quality_grade:
                if m.crop_quality_grade.upper() in ["A", "5", "4"]:
                    recent_events.append(f"+2 (Quality Grade {m.crop_quality_grade})")
                elif m.crop_quality_grade.upper() in ["C", "1", "2"]:
                    recent_events.append(f"-5 (Quality Grade {m.crop_quality_grade})")
        elif m.delivered == "NO":
            recent_events.append(f"-20 (No-Show on Pool {m.pool_id})")
            
    if not recent_events:
        recent_events = ["No recent events logged"]

    return {
        "score": score,
        "transaction_count": transaction_count,
        "quality_grades": quality_grades,
        "recent_events": recent_events
    }
