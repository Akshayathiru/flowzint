# pyrefly: ignore [missing-import]
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Response
# pyrefly: ignore [missing-import]
from fastapi.responses import JSONResponse, FileResponse
from twilio.twiml.voice_response import VoiceResponse
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
from sarvam_client import sarvam_client, MOCK_MODE
from transcript_parser import parse_transcript
from callback_service import call_farmer_with_price, call_buyer_with_offer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Voice & Language Layer API")

MEMBER2_ENDPOINT = os.getenv("MEMBER2_ENDPOINT", "http://localhost:8000/add_farmer")
BASE_URL = os.getenv("BASE_URL", "https://your-ngrok-url.ngrok.io")

# Session cache to store pending pledges before confirmation
PENDING_PLEDGES = {}
CONVERSATION_HISTORY = {}

SYSTEM_PROMPT = """
You are Mandi Mitra, a friendly voice assistant for Indian farmers.
Collect these four things through natural conversation:
1. Farmer name
2. Crop name
3. Quantity in kilograms
4. Village or district location

Rules:
- Speak in whatever language the farmer uses
  (Hindi, Tamil, Telugu, English)
- Ask one question at a time naturally
- Never list all questions at once
- Once you have all four, confirm back in their language
- If farmer confirms, respond ONLY with:
  CONFIRMED:{name}:{crop}:{quantity}:{location}
- If unclear, ask a simple follow-up
- Keep responses short - this is a phone call
"""

async def add_farmer(payload: dict):
    res = requests.post(MEMBER2_ENDPOINT, json={
        "crop": payload["crop"],
        "quantity": payload["quantity"],
        "location": payload["location"],
        "phone": payload["phone"],
        "name": payload["name"]
    }, timeout=10)
    res.raise_for_status()
    return res.json()

@app.post("/inbound-call")
async def inbound_call(request: Request):
    try:
        form = await request.form()
        phone = form.get("From")
        audio_url = form.get("RecordingUrl")

        # Step 1 - Sarvam STT
        transcript = await sarvam_client.transcribe_audio(audio_url)

        # Step 2 - Maintain conversation per farmer phone
        history = CONVERSATION_HISTORY.get(phone, [])
        history.append({"role": "user", "content": transcript})

        # Step 3 - Sarvam LLM understands naturally
        response = await sarvam_client.chat(
            system=SYSTEM_PROMPT,
            messages=history
        )
        reply_text = response["reply"]
        history.append({"role": "assistant", "content": reply_text})
        CONVERSATION_HISTORY[phone] = history

        # Step 4 - Check if all details collected and confirmed
        if reply_text.startswith("CONFIRMED:"):
            parts = reply_text.split(":")
            name = parts[1].strip()
            crop = parts[2].strip()
            quantity = float(parts[3].strip())
            location = parts[4].strip()

            await add_farmer({
                "name": name,
                "crop": crop,
                "quantity": quantity,
                "location": location,
                "phone": phone
            })

            reply_text = (
                "Thank you! Your produce has been registered. "
                "We will call you when a buyer is found."
            )
            CONVERSATION_HISTORY.pop(phone, None)

        # Step 5 - Sarvam TTS speaks reply back to farmer
        audio_bytes = await sarvam_client.text_to_speech(reply_text)
        os.makedirs("/tmp", exist_ok=True)
        audio_path = f"/tmp/{phone}_reply.wav"
        with open(audio_path, "wb") as f:
            f.write(audio_bytes)

        twiml = VoiceResponse()
        twiml.play(f"{BASE_URL}/audio/{phone}_reply.wav")
        twiml.record(
            action="/inbound-call",
            max_length=10,
            play_beep=True
        )
        return Response(
            content=str(twiml),
            media_type="application/xml"
        )
    except Exception as e:
        logger.error(f"Sarvam API failed after retries: {e}")
        fallback = VoiceResponse()
        fallback.say(
            "Sorry, we are facing a technical issue. "
            "Please call back in a few minutes.",
            language="hi-IN"
        )
        return Response(
            content=str(fallback),
            media_type="application/xml"
        )

@app.get("/audio/{filename}")
async def serve_audio(filename: str):
    return FileResponse(f"/tmp/{filename}",
                        media_type="audio/wav")



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

