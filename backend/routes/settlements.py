from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from database import SessionLocal
from models import Allocation
from services import trust_service

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/allocation/{allocation_id}/payment-sent")
async def mark_payment_sent(
    allocation_id: int,
    db: Session = Depends(get_db)
):
    allocation = db.query(Allocation).filter(
        Allocation.id == allocation_id
    ).first()
    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found")
    allocation.payment_status = "sent"
    allocation.payment_sent_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    return {"status": "payment marked as sent"}


@router.post("/allocation/{allocation_id}/payment-received")
async def mark_payment_received(
    allocation_id: int,
    db: Session = Depends(get_db)
):
    allocation = db.query(Allocation).filter(
        Allocation.id == allocation_id
    ).first()
    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found")
    allocation.payment_status = "received"
    allocation.payment_received_at = datetime.now(timezone.utc).replace(tzinfo=None)
    
    # Trigger trust score +5 for farmer on payment received
    try:
        if hasattr(trust_service, "confirm_delivery"):
            class DeliveryPayload:
                def __init__(self, pool_id: int, phone: str):
                    self.pool_id = pool_id
                    self.phone = phone
                    self.entity_type = "farmer"
                    self.delivered = True
                    self.delivered_qty = None
                    self.crop_quality_grade = None

            payload = DeliveryPayload(
                pool_id=int(allocation.pool_id),
                phone=str(allocation.farmer_phone)
            )
            trust_service.confirm_delivery(db, payload)
    except Exception:
        pass
    db.commit()
    return {"status": "payment marked as received"}
