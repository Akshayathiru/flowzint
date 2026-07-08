# pyrefly: ignore [missing-import]
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Response
# pyrefly: ignore [missing-import]
from fastapi.responses import JSONResponse, FileResponse
from twilio.twiml.voice_response import VoiceResponse, Gather
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
from sarvam_client import sarvam_client, MOCK_MODE, transcribe_audio
from transcript_parser import parse_transcript, parse_intent, parse_bid, parse_rejection_choice
from callback_service import call_farmer_with_price, call_buyer_with_offer, call_farmer_rejection_options
import pooling_engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Voice & Language Layer API")

@app.get("/api/pools/active")
async def get_active_pools():
    """
    Returns the in-memory pools in the format expected by the Next.js frontend.
    """
    active_pools = []
    for commodity, pool in pooling_engine.pools.items():
        status_map = {
            "collecting": "filling",
            "farmer_confirming": "auctioning",
            "buyer_bidding": "auctioning"
        }
        
        frontend_pool = {
            "poolId": commodity,
            "crop": commodity.capitalize(),
            "location": "Various Locations",
            "currentQtyKg": pool["total_kg"],
            "targetQtyKg": pool.get("threshold_kg", 50.0),
            "farmersCount": len(pool.get("farmers", [])),
            "minutesRemaining": 60,
            "status": status_map.get(pool.get("status", "collecting"), "filling"),
            "geoCenter": [20.5937, 78.9629]
        }
        active_pools.append(frontend_pool)
    
    return active_pools

@app.get("/api/pools/{pool_id}")
async def get_pool_details(pool_id: str):
    pool = pooling_engine.pools.get(pool_id.lower())
    if not pool:
        raise HTTPException(status_code=404, detail="Pool not found")
        
    status_map = {
        "collecting": "filling",
        "farmer_confirming": "auctioning",
        "buyer_bidding": "auctioning"
    }
    
    return {
        "poolId": pool_id,
        "crop": pool_id.capitalize(),
        "location": "Various Locations",
        "currentQtyKg": pool["total_kg"],
        "targetQtyKg": pool.get("threshold_kg", 50.0),
        "farmersCount": len(pool.get("farmers", [])),
        "minutesRemaining": 60,
        "status": status_map.get(pool.get("status", "collecting"), "filling"),
        "geoCenter": [20.5937, 78.9629]
    }

@app.get("/api/pools/{pool_id}/members")
async def get_pool_members(pool_id: str):
    pool = pooling_engine.pools.get(pool_id.lower())
    if not pool:
        return []
        
    members = []
    for f in pool.get("farmers", []):
        members.append({
            "phone": f.get("phone", "Unknown"),
            "qtyKg": f.get("kg", 0.0),
            "language": f.get("language", "hi-IN"),
            "calledAt": "2024-05-18T10:00:00Z",
            "trustScore": 85,
            "confidence": 0.9,
            "isFirstCall": True,
            "callbackStatus": f.get("status", "pending"),
            "farmerResponse": "yes" if f.get("status") == "confirmed" else "no" if f.get("status") == "declined" else "pending"
        })
    return members

MEMBER2_ENDPOINT = os.getenv("MEMBER2_ENDPOINT", "http://localhost:8000/add_farmer")
BASE_URL = os.getenv("BASE_URL", "https://your-ngrok-url.ngrok.io")

# Session cache to store pending pledges before confirmation
PENDING_PLEDGES = {}
CONVERSATION_HISTORY = {}

async def fetch_twilio_audio(recording_url: str) -> bytes:
    if not recording_url:
        return None
    try:
        TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
        TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
        auth = (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) if TWILIO_ACCOUNT_SID else None
        resp = requests.get(recording_url + ".wav", auth=auth)
        if resp.status_code == 200:
            return resp.content
        else:
            logger.error(f"Failed to fetch Twilio recording: {resp.status_code}")
    except Exception as e:
        logger.error(f"Error fetching Twilio recording: {e}")
    return None

@app.post("/twilio/incoming")
async def twilio_incoming(request: Request):
    """Stage 1: Ask for language"""
    form_data = await request.form()
    phone_number = form_data.get("From", "unknown")
    logger.info(f"Incoming call from {phone_number}")

    # Determine base url dynamically to prevent ngrok tunnel change mismatches
    base_url = str(request.base_url).rstrip("/")

    response = VoiceResponse()
    gather = Gather(num_digits=1, action=f"{base_url}/twilio/language-selected", method="POST")
    gather.say("Welcome to Mandi Mitra.", language="en-IN")
    gather.say("Tamil-ku, ondrai azhuthavum.", language="en-IN")
    gather.say("Telugu kosam, rendu nok-kandi.", language="en-IN")
    gather.say("Hindi ke liye, teen dabayen.", language="en-IN")
    gather.say("For English, press 4.", language="en-IN")
    response.append(gather)
    return Response(content=str(response), media_type="text/xml")

@app.post("/twilio/language-selected")
async def twilio_language_selected(request: Request):
    """Stage 2: Save language and ask for details"""
    form_data = await request.form()
    phone_number = form_data.get("From", "unknown")
    digits = form_data.get("Digits", "3")
    
    lang_map = {"1": "ta-IN", "2": "te-IN", "3": "hi-IN", "4": "en-IN"}
    lang = lang_map.get(digits, "hi-IN")
    pooling_engine.set_user_language(phone_number, lang)
    
    # Determine base url dynamically to prevent ngrok tunnel change mismatches
    base_url = str(request.base_url).rstrip("/")

    response = VoiceResponse()
    
    if lang == "ta-IN":
        prompt = "Beep sathathirku piragu, ungal maavattam, vilaiporul, alavu, matrum oru kilo-vukkaana edhir-paarkum vilai-yai kooravum."
    elif lang == "te-IN":
        prompt = "Beep taruvata, mee zilla, panta, parimanam mariyu oka kilo ku aashinche dharanu cheppandi."
    elif lang == "hi-IN":
        prompt = "Beep ke baad, apna zila, fasal, matra aur prati kilo ummeed ki gayi keemat batayein."
    else:
        prompt = "Please state your district, commodity, quantity, and expected price per kilogram after the beep."
        
    response.say(prompt, language="en-IN")
    response.record(action=f"{base_url}/twilio/recording?commodity=unknown", method="POST", max_length=15, play_beep=True)
    return Response(content=str(response), media_type="text/xml")

@app.post("/twilio/recording")
async def twilio_recording(request: Request):
    """Stage 3: Parse inbound details and check threshold"""
    try:
        form_data = await request.form()
        phone_number = form_data.get("From", "unknown")
        recording_url = form_data.get("RecordingUrl")
        
        logger.info(f"Recording received for {phone_number}. URL: {recording_url}")
        
        audio_bytes = await fetch_twilio_audio(recording_url)
        if audio_bytes:
            stt_result = transcribe_audio(audio_bytes, phone_number)
            transcript = stt_result["transcript"]
            logger.info(f"Transcript for {phone_number}: {transcript}")
            
            parsed_data = parse_transcript(transcript)
            commodity = parsed_data.get("commodity")
            
            valid_produce = {"tomato", "onion", "potato", "apple", "banana", "mango", "carrot", "cabbage", "orange", "grapes", "spinach", "garlic", "ginger", "lemon", "brinjal", "ladies finger", "chilli"}
            
            if not commodity or commodity.lower() not in valid_produce:
                logger.warning(f"Invalid commodity: {commodity}")
                error_resp = VoiceResponse()
                error_resp.say("Sorry, we only accept fruits and vegetables, or we did not understand the item. Please try again.", language="en-IN")
                return Response(content=str(error_resp), media_type="text/xml")
                
            quantity = parsed_data.get("quantity_kg")
            price = parsed_data.get("expected_price")
            
            if not quantity or not price:
                logger.warning("Missing quantity or price.")
                error_resp = VoiceResponse()
                error_resp.say("Sorry, we did not understand the quantity or price clearly. Please try again.", language="en-IN")
                return Response(content=str(error_resp), media_type="text/xml")

            lang = pooling_engine.get_user_language(phone_number)
            
            logger.info(f"Parsed: commodity={commodity}, qty={quantity}, price={price}, lang={lang}")
            
            pooling_engine.add_farmer_to_pool(commodity, phone_number, quantity, price, lang)
            # Check threshold
            min_price = pooling_engine.check_threshold(commodity)
            if min_price is not None:
                pool = pooling_engine.get_pool(commodity)
                for farmer in pool["farmers"]:
                    call_farmer_with_price(
                        farmer["phone"], farmer["language"], commodity, farmer["kg"], min_price
                    )
        else:
            logger.warning(f"No audio bytes received for {phone_number}. RecordingUrl: {recording_url}")

        response = VoiceResponse()
        response.say("Thank you. Your details have been recorded. We will call you back when the pool is ready.", language="en-IN")
        return Response(content=str(response), media_type="text/xml")

    except Exception as e:
        logger.error(f"CRASH in /twilio/recording: {e}", exc_info=True)
        response = VoiceResponse()
        response.say("Thank you for calling Mandi Mitra. Your details have been noted.", language="en-IN")
        return Response(content=str(response), media_type="text/xml")

@app.post("/twilio/farmer-confirm-recording")
async def twilio_farmer_confirm_recording(request: Request):
    """Stage 4: Farmer says yes/no to average price"""
    form_data = await request.form()
    phone_number = form_data.get("From", "unknown")
    recording_url = form_data.get("RecordingUrl")
    
    audio_bytes = await fetch_twilio_audio(recording_url)
    if audio_bytes:
        transcript = transcribe_audio(audio_bytes, phone_number)["transcript"]
        intent = parse_intent(transcript)
        logger.info(f"Farmer {phone_number} confirmation: {intent} (Transcript: {transcript})")
        
        # Hardcoding tomato for demo simplicity
        commodity = "tomato" 
        if intent == "yes":
            pooling_engine.update_farmer_status(commodity, phone_number, "confirmed")
            
            if pooling_engine.all_farmers_confirmed(commodity):
                pool = pooling_engine.get_pool(commodity)
                # Call buyer (hardcoding buyer number for demo)
                buyer_phone = "+19999999999" # Need to replace in real testing
                call_buyer_with_offer(
                    buyer_phone, commodity, pool["total_kg"], pool["minimum_price"], "Multiple Districts", ask_for_counteroffer=True
                )
        else:
            pooling_engine.update_farmer_status(commodity, phone_number, "rejected")

    return Response(content="<Response><Say>Thank you.</Say></Response>", media_type="text/xml")

@app.post("/twilio/buyer-bid-recording")
async def twilio_buyer_bid_recording(request: Request):
    """Stage 5: Buyer states bid"""
    form_data = await request.form()
    recording_url = form_data.get("RecordingUrl")
    phone_number = form_data.get("From", "unknown")
    
    audio_bytes = await fetch_twilio_audio(recording_url)
    if audio_bytes:
        transcript = transcribe_audio(audio_bytes, phone_number)["transcript"]
        bid = parse_bid(transcript)
        logger.info(f"Buyer bid: {bid} (Transcript: {transcript})")
        
        commodity = "tomato"
        pool = pooling_engine.get_pool(commodity)
        if pool and bid >= pool["minimum_price"]:
            logger.info("Deal successful!")
            # In real system, trigger success call/SMS here
        elif pool:
            logger.info("Deal rejected. Calling farmers with options.")
            for farmer in pool["farmers"]:
                call_farmer_rejection_options(farmer["phone"], farmer["language"])

    return Response(content="<Response><Say>Thank you for your bid.</Say></Response>", media_type="text/xml")

@app.post("/twilio/farmer-reject-recording")
async def twilio_farmer_reject_recording(request: Request):
    """Stage 6: Farmer chooses market or pool"""
    form_data = await request.form()
    phone_number = form_data.get("From", "unknown")
    recording_url = form_data.get("RecordingUrl")
    
    audio_bytes = await fetch_twilio_audio(recording_url)
    if audio_bytes:
        transcript = transcribe_audio(audio_bytes, phone_number)["transcript"]
        choice = parse_rejection_choice(transcript)
        logger.info(f"Farmer {phone_number} choice: {choice} (Transcript: {transcript})")
        
    return Response(content="<Response><Say>Thank you, your preference is noted.</Say></Response>", media_type="text/xml")

@app.get("/pools")
async def get_all_pools():
    """
    Frontend endpoint to fetch the live status of all commodity pools.
    Returns the current dictionary state from the pooling engine.
    """
    return JSONResponse(content=pooling_engine.pools)

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

        if not audio_url:
            # Initial call, no recording yet
            welcome_twiml = VoiceResponse()
            welcome_twiml.say("Welcome to Mandi Mitra. Please tell me your name, crop, quantity, and location after the beep.", language="en-IN")
            welcome_twiml.record(
                action="/inbound-call",
                max_length=15,
                play_beep=True
            )
            return Response(content=str(welcome_twiml), media_type="application/xml")

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

        # Determine base url dynamically to prevent ngrok tunnel change mismatches
        base_url = str(request.base_url).rstrip("/")
        twiml = VoiceResponse()
        twiml.play(f"{base_url}/audio/{phone}_reply.wav")
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


@app.post("/twilio/outbound-confirm-twiml")
async def twilio_outbound_confirm_twiml(request: Request):
    """
    Returns the initial TwiML for an outbound farmer confirmation call in their chosen language.
    """
    base_url = str(request.base_url).rstrip("/")
    params = request.query_params
    commodity = params.get("commodity", "tomato")
    price = params.get("price", "20")
    language = params.get("language", "hi-IN")
    
    templates = {
        "ta-IN": "Vannakkam. Ungal {commodity} pool mudinthathu. Oru kilo-vukku {price} rubaai kidaikkum. Urudhi-padutha aam ena sollungal, rathu seyya illai ena sollungal.",
        "te-IN": "Namaskaram. Mee {commodity} pool poorthaindi. Kilo ku {price} roopayalu labhistundi. Nirdharinchadaniki avunu ani cheppandi, raddhu cheyadaniki vaddu ani cheppandi.",
        "hi-IN": "Namaste. Aapka {commodity} pool poora ho gaya hai. Aapko prati kilo {price} rupaye milenge. Pushti karne ke liye haan kahein, ya radd karne ke liye nahi kahein.",
        "en-IN": "Welcome back from Mandi Mitra. The pool for {commodity} is complete. The average price is {price} rupees per kilogram. Please say yes to confirm your entry, or say no to cancel, after the beep."
    }
    
    lang_key = language if language in templates else "hi-IN"
    message = templates[lang_key].format(commodity=commodity, price=price)
    
    response = VoiceResponse()
    # Always use en-IN voice so it can read the transliterated text reliably
    response.say(message, language="en-IN")
    response.record(action=f"{base_url}/twilio/farmer-confirm-recording", method="POST", max_length=10, play_beep=True)
    return Response(content=str(response), media_type="text/xml")


