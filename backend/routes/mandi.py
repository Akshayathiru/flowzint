from fastapi import APIRouter

from services.mandi_service import get_mandi_price

router = APIRouter()


@router.get("/mandi_price")
def mandi_price(
    crop: str,
    location: str
):
    return get_mandi_price(crop, location)