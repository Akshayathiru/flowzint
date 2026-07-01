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
    BuyerCallbackResponse,
    InboundConfirmRequest,
    InboundConfirmResponse
)
from sarvam_client import transcribe_audio, MOCK_MODE
from transcript_parser import parse_transcript
from callback_service import call_farmer_with_price, call_buyer_with_offer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Voice & Language Layer API")

MEMBER2_ENDPOINT = os.getenv("MEMBER2_ENDPOINT", "http://localhost:8000/add_farmer")

# Session cache to store pending pledges before confirmation
PENDING_PLEDGES = {}

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
    and caches the pending pledge, returning a session_id and playback confirmation.
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

    # Generate a unique session ID and cache the pending pledge
    session_id = f"sess_{phone_number}"
    PENDING_PLEDGES[session_id] = {
        "phone_number": phone_number,
        "commodity": parsed_data["commodity"],
        "quantity_kg": parsed_data["quantity_kg"],
        "location": parsed_data["location"],
        "language_detected": language_code
    }

    commodity_name = parsed_data["commodity"] or "crop"
    qty_val = parsed_data["quantity_kg"] or 0
    loc_val = parsed_data["location"] or "your location"
    
    # Text confirmation to play back to the farmer
    message_to_speak = f"You said {qty_val} kg of {commodity_name} in {loc_val}. Is that correct? Say Yes to confirm or No to cancel."

    response_data = InboundCallResponse(
        commodity=parsed_data["commodity"],
        quantity_kg=parsed_data["quantity_kg"],
        location=parsed_data["location"],
        phone_number=phone_number,
        raw_transcript=transcript,
        language_detected=language_code,
        confidence_flag=parsed_data["confidence_flag"],
        session_id=session_id,
        message_to_speak=message_to_speak
    )

    return response_data


@app.post("/inbound-confirm", response_model=InboundConfirmResponse)
async def handle_inbound_confirm(
    session_id: str = Form(...),
    phone_number: str = Form(...),
    dtmf: str = Form(None),
    audio: UploadFile = File(None)
):
    """
    Handles confirmation step. If farmer confirms (DTMF 1 or saying yes), 
    the pending pledge is forwarded to /add_farmer. If they cancel (DTMF 2 or saying no), 
    it is fully discarded. Ambiguous responses fallback to a DTMF prompt.
    """
    logger.info(f"Received confirmation for session {session_id}, dtmf={dtmf}")

    if session_id not in PENDING_PLEDGES:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    pending_data = PENDING_PLEDGES[session_id]
    confirmed = None

    # Option A: Check DTMF input
    if dtmf:
        if dtmf == "1":
            confirmed = True
        elif dtmf == "2":
            confirmed = False
        else:
            confirmed = None

    # Option B: Check Speech confirmation input if no DTMF provided
    elif audio:
        try:
            audio_bytes = await audio.read()
            stt_result = transcribe_audio(audio_bytes, phone_number)
            transcript_text = stt_result.get("transcript", "").lower()
            
            yes_keywords = ["yes", "correct", "haan", "haanji", "confirm", "right", "sari", "aamaam", "avunu", "yas"]
            no_keywords = ["no", "cancel", "nahin", "wrong", "illai", "kaadhu", "na"]
            
            if any(kw in transcript_text for kw in yes_keywords):
                confirmed = True
            elif any(kw in transcript_text for kw in no_keywords):
                confirmed = False
        except Exception as e:
            logger.error(f"Error reading confirmation audio: {e}")

    # Process confirmation outcome
    if confirmed is True:
        # Confirm and post to backend
        backend_payload = {
            "crop": pending_data["commodity"],
            "quantity": pending_data["quantity_kg"],
            "location": pending_data["location"],
            "phone": pending_data["phone_number"]
        }
        
        try:
            logger.info(f"Confirmed. Forwarding payload {backend_payload} to {MEMBER2_ENDPOINT}")
            res = requests.post(MEMBER2_ENDPOINT, json=backend_payload, timeout=5)
            res.raise_for_status()
        except Exception as e:
            logger.error(f"Failed to post to core backend: {e}")
            raise HTTPException(status_code=500, detail="Failed to save crop registration to core database")
            
        del PENDING_PLEDGES[session_id]
        return InboundConfirmResponse(
            status="confirmed",
            message_to_speak="Thank you! Your crop registration is successful and has been pooled."
        )

    elif confirmed is False:
        # Discard the call
        del PENDING_PLEDGES[session_id]
        return InboundConfirmResponse(
            status="cancelled",
            message_to_speak="The registration was cancelled. Thank you."
        )
        
    else:
        # Ambiguous response: Fallback to DTMF prompt
        return InboundConfirmResponse(
            status="ambiguous",
            message_to_speak="Sorry, I didn't get that. Press 1 to confirm, or press 2 to cancel."
        )



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


@app.post("/notify")
async def notify_user(
    phone_number: str = Form(...),
    message: str = Form(...),
    language: str = Form("hi-IN")
):
    """
    HTTP proxy to trigger an outbound notification call to a user.
    Called by backend services to notify farmers/buyers.
    """
    from sarvam_client import trigger_outbound_call
    success = trigger_outbound_call(phone_number, message, language)
    return {"success": success}

