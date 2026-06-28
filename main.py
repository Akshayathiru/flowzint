# pyrefly: ignore [missing-import]
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.responses import JSONResponse
import logging
import requests  # type: ignore
import os

from models import (
    InboundCallResponse, 
    FarmerCallbackRequest, 
    FarmerCallbackResponse,
    BuyerCallbackRequest,
    BuyerCallbackResponse
)
from sarvam_client import transcribe_audio, MOCK_MODE
from transcript_parser import parse_transcript
from callback_service import call_farmer_with_price, call_buyer_with_offer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Voice & Language Layer API")

MEMBER2_ENDPOINT = os.getenv("MEMBER2_ENDPOINT", "http://localhost:8000/add_farmer")

@app.post("/inbound-call", response_model=InboundCallResponse)
async def handle_inbound_call(
    phone_number: str = Form(...),
    audio: UploadFile = File(...),
    crop: str = Form(None),
    quantity: float = Form(None),
    location: str = Form(None),
    language: str = Form(None)
):
    """
    Accepts raw audio and phone number, transcribes via Saaras, extracts fields, 
    and returns structured JSON.
    """
    try:
        audio_bytes = await audio.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid audio file")

    logger.info(f"Received inbound call from {phone_number}, MOCK_MODE={MOCK_MODE}")

    # 1. Transcribe audio
    stt_result = transcribe_audio(audio_bytes, phone_number)
    transcript = stt_result["transcript"]
    language_code = stt_result["language_code"]

    # 2. Parse transcript
    parsed_data = parse_transcript(transcript)

    # Override parsed values if optional explicit Form fields are provided
    if crop:
        parsed_data["commodity"] = crop.lower()
    if quantity:
        parsed_data["quantity_kg"] = quantity
    if location:
        parsed_data["location"] = location.lower()
    if language:
        language_code = language

    # Recalculate confidence if we forced the data
    if crop or quantity or location:
        parsed_data["confidence_flag"] = bool(parsed_data["commodity"] and parsed_data["quantity_kg"] and parsed_data["location"])

    response_data = InboundCallResponse(
        commodity=parsed_data["commodity"],
        quantity_kg=parsed_data["quantity_kg"],
        location=parsed_data["location"],
        phone_number=phone_number,
        raw_transcript=transcript,
        language_detected=language_code,
        confidence_flag=parsed_data["confidence_flag"]
    )

    # Map fields for Member 2's backend (which expects crop, quantity, location, phone)
    backend_payload = {
        "crop": response_data.commodity,
        "quantity": response_data.quantity_kg,
        "location": response_data.location,
        "phone": response_data.phone_number
    }

    try:
        logger.info(f"Forwarding farmer info to Member 2 at {MEMBER2_ENDPOINT} with payload {backend_payload}")
        requests.post(MEMBER2_ENDPOINT, json=backend_payload, timeout=5)
    except Exception as e:
        logger.warning(f"Failed to post to Member 2: {e}")

    return response_data


@app.post("/callback/farmer", response_model=FarmerCallbackResponse)
async def callback_farmer(request: FarmerCallbackRequest):
    """
    Triggers an outbound call to the farmer in their native language with the final price.
    """
    result = call_farmer_with_price(
        phone_number=request.phone_number,
        language=request.language,
        commodity=request.commodity,
        quantity_kg=request.quantity_kg,
        final_price_per_kg=request.final_price_per_kg
    )
    
    if result["status"] == "failure":
        return JSONResponse(status_code=400, content={"status": "failure", "message_used": "Call failed"})
        
    return FarmerCallbackResponse(status=result["status"], message_used=result["message_used"])


@app.post("/callback/buyer", response_model=BuyerCallbackResponse)
async def callback_buyer(request: BuyerCallbackRequest):
    """
    Calls buyer with an offer and optionally asks for counter-offer.
    """
    result = call_buyer_with_offer(
        phone_number=request.phone_number,
        commodity=request.commodity,
        quantity_kg=request.quantity_kg,
        mandi_rate=request.mandi_rate,
        location=request.location,
        ask_for_counteroffer=request.ask_for_counteroffer
    )
    
    return BuyerCallbackResponse(
        buyer_phone=result["buyer_phone"],
        counter_offer_price=result["counter_offer_price"]
    )
