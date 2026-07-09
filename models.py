from pydantic import BaseModel
from typing import Optional


class InboundCallResponse(BaseModel):
    commodity: Optional[str]
    quantity_kg: Optional[float]
    expected_price: Optional[float]
    location: Optional[str]
    phone_number: str
    raw_transcript: str
    language_detected: str
    confidence_flag: bool
    session_id: Optional[str] = None
    message_to_speak: Optional[str] = None



class FarmerCallbackRequest(BaseModel):
    phone_number: str
    language: str
    commodity: str
    quantity_kg: float
    final_price_per_kg: float


class FarmerCallbackResponse(BaseModel):
    status: str
    message_used: str


class BuyerCallbackRequest(BaseModel):
    phone_number: str
    commodity: str
    quantity_kg: float
    mandi_rate: float
    location: str
    ask_for_counteroffer: bool = False


class BuyerCallbackResponse(BaseModel):
    buyer_phone: str
    counter_offer_price: Optional[float]


class InboundConfirmRequest(BaseModel):
    session_id: str
    phone_number: str
    dtmf: Optional[str] = None


class InboundConfirmResponse(BaseModel):
    status: str  # "confirmed", "cancelled", "ambiguous"
    message_to_speak: str

