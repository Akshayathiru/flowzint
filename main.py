from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import logging
import requests
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

MEMBER2_ENDPOINT = os.getenv("MEMBER2_ENDPOINT", "http://localhost:8001/pool/add")

@app.post("/inbound-call", response_model=InboundCallResponse)
async def handle_inbound_call(
    phone_number: str = Form(...),
    audio: UploadFile = File(...)
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

    response_data = InboundCallResponse(
        commodity=parsed_data["commodity"],
        quantity_kg=parsed_data["quantity_kg"],
        location=parsed_data["location"],
        phone_number=phone_number,
        raw_transcript=transcript,
        language_detected=language_code,
        confidence_flag=parsed_data["confidence_flag"]
    )

    # Note: Could also pass data to Member 2's pooling engine here if required immediately,
    # or rely on the caller of this API to forward it. Requirements say:
    # "Store nothing permanently — use in-memory dicts or pass data to Member 2's pooling engine via HTTP POST to http://localhost:8001/pool/add"
    # We will attempt to pass it to Member 2:
    try:
        if MOCK_MODE:
            logger.info(f"[MOCK] Passing data to Member 2 at {MEMBER2_ENDPOINT}")
        else:
            requests.post(MEMBER2_ENDPOINT, json=response_data.dict(), timeout=5)
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
