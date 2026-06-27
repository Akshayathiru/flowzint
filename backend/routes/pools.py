from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal

from services.pooling_engine import close_pool
from services.pools_service import get_pool_summary

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/close_pool/{pool_id}")
def close_pool_route(
    pool_id: int,
    db: Session = Depends(get_db)
):
    return close_pool(db, pool_id)


@router.get("/pool_summary/{pool_id}")
def pool_summary(
    pool_id: int,
    db: Session = Depends(get_db)
):
    return get_pool_summary(db, pool_id)