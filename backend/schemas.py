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

class TrustUpdate(BaseModel):
    phone: str
    delivered: bool

class FarmerConfirm(BaseModel):
    pool_id: int
    phone: str
    accepted: bool