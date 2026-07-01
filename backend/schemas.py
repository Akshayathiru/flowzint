from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FarmerCreate(BaseModel):
    crop: str
    quantity: float
    location: str
    phone: str

class OfferCreate(BaseModel):
    buyer_id: int
    pool_id: int
    price: float
    quantity: float
    binding_bid: Optional[bool] = True

class PoolResponse(BaseModel):
    id: int
    crop: str
    location: str
    total_quantity: float
    status: str

class BuyerCreate(BaseModel):
    name: str
    phone: str
    crop: str
    location: str
    min_quantity: float

class BuyerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    crop: Optional[str] = None
    location: Optional[str] = None
    min_quantity: Optional[float] = None

class TrustUpdate(BaseModel):
    phone: str
    delivered: bool

class FarmerConfirm(BaseModel):
    pool_id: int
    phone: str
    accepted: bool
    crop_quality_grade: Optional[str] = None

class DeliveryConfirm(BaseModel):
    pool_id: int
    phone: str
    entity_type: str  # "farmer" or "buyer"
    delivered: bool
    delivered_qty: Optional[float] = None
    crop_quality_grade: Optional[str] = None
