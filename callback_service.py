import logging
from typing import Optional
from sarvam_client import trigger_outbound_call, MOCK_MODE

logger = logging.getLogger(__name__)

FARMER_TEMPLATES = {
    "ta-IN": "வணக்கம், உங்கள் {commodity} pool முடிந்தது. கிலோவுக்கு {price} ரூபாய் கிடைக்கும்.",
    "te-IN": "నమస్కారం, మీ {commodity} pool మూసివేయబడింది. కిలోకు {price} రూపాయలు వస్తాయి.",
    "hi-IN": "नमस्ते, आपका {commodity} pool बंद हो गया। किलो के {price} रुपये मिलेंगे।",
    "en-IN": "Hello, your {commodity} pool is closed. You will get {price} rupees per kilo."
}

import os
from twilio.rest import Client

def call_farmer_with_price(phone_number: str, language: str, commodity: str, quantity_kg: float, final_price_per_kg: float) -> dict:
    """
    Constructs the localized message and calls the farmer via Twilio.
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_phone = os.getenv("TWILIO_PHONE_NUMBER")
    base_url = os.getenv("BASE_URL") or os.getenv("PUBLIC_URL")
    
    if not all([account_sid, auth_token, from_phone, base_url]):
        logger.error("Missing Twilio credentials or BASE_URL for outbound call.")
        return {"status": "failure", "message_used": "Missing Twilio config"}
        
    twiml_url = f"{base_url}/twilio/outbound-confirm-twiml?commodity={commodity}&price={final_price_per_kg}&language={language}"
    
    if MOCK_MODE or account_sid == "mock" or auth_token == "mock":
        logger.info(f"[MOCK] Triggered outbound call to {phone_number} via Twilio URL: {twiml_url}")
        return {"status": "success", "message_used": twiml_url}

    client = Client(account_sid, auth_token)
    try:
        call = client.calls.create(to=phone_number, from_=from_phone, url=twiml_url)
        logger.info(f"Triggered outbound call to {phone_number}. SID: {call.sid}")
        return {"status": "success", "message_used": twiml_url}
    except Exception as e:
        logger.error(f"Failed to place outbound Twilio call: {e}")
        return {"status": "failure", "message_used": str(e)}


def call_buyer_with_offer(phone_number: str, commodity: str, quantity_kg: float, mandi_rate: float, location: str, ask_for_counteroffer: bool) -> dict:
    """
    Calls the buyer with a pooled offer. If ask_for_counteroffer is true, records and extracts the counter-offer.
    """
    # Using English for buyer as default per requirements unless specified otherwise
    message = f"You have a pooled offer: {quantity_kg} kg of {commodity} from {location}. Mandi rate is {mandi_rate}. Your counter-offer?"
    
    # In a real scenario, Bulbul triggers the call. To record the response and transcribe it (Saaras),
    # Sarvam's conversational API would be needed, or a webhook setup with a telephony provider.
    success = trigger_outbound_call(phone_number, message, "en-IN")
    
    counter_offer_price = None
    if ask_for_counteroffer:
        # Simulate receiving a counter offer back from the buyer
        if MOCK_MODE:
            logger.info(f"[MOCK] Simulated receiving a counter-offer from {phone_number}")
            counter_offer_price = mandi_rate - 2.0 # Mock logic: offer slightly lower than mandi rate
        else:
            # Here we would handle the actual webhook / async callback from Sarvam / telephony provider
            # containing the buyer's recorded audio, then send to Saaras, then parse it.
            # For simplicity in this sync API, we'll just mock it or return None.
            pass

    return {
        "buyer_phone": phone_number,
        "counter_offer_price": counter_offer_price if success else None
    }


async def call_farmer_for_confirmation(
    farmer_phone: str,
    buyer_name: str,
    crop: str,
    price_per_kg: float,
    quantity_kg: float
) -> dict:
    """
    PHASE 2 — Outbound confirmation call via Bulbul AI.
    Calls the farmer after auction settlement to confirm acceptance.
    Requires a Bulbul webhook endpoint to receive the farmer's spoken
    response. Implement once webhook URL is configured in production.
    """
    # TODO PHASE 2: Configure BULBUL_WEBHOOK_URL in environment variables
    # and implement the two-way call flow here.
    logger.info(
        f"[PHASE 2 STUB] Would call {farmer_phone} to confirm "
        f"{quantity_kg}kg of {crop} at Rs{price_per_kg}/kg from {buyer_name}"
    )
    return {"status": "phase_2_pending", "farmer_phone": farmer_phone}


def call_farmer_rejection_options(phone_number: str, language: str) -> dict:
    """
    Calls the farmer to give them options after buyer rejects.
    """
    message = "Your deal was rejected by the buyer. Would you like to sell in the open market or stay in the pool?"
    lang_key = language if language in FARMER_TEMPLATES else "hi-IN"
    if lang_key == "hi-IN":
        message = "खरीदार ने आपका सौदा रद्द कर दिया है। क्या आप खुले बाजार में बेचना चाहेंगे या पूल में रहना चाहेंगे?"
    elif lang_key == "te-IN":
        message = "కొనుగోలుదారు మీ ఒప్పందాన్ని తిరస్కరించారు. మీరు బహిరంగ మార్కెట్లో విక్రయించాలనుకుంటున్నారా లేదా పూల్ లో ఉండాలనుకుంటున్నారా?"
    elif lang_key == "ta-IN":
        message = "வாங்குபவர் உங்கள் ஒப்பந்தத்தை நிராகரித்துவிட்டார். நீங்கள் திறந்த சந்தையில் விற்க விரும்புகிறீர்களா அல்லது பூலில் இருக்க விரும்புகிறீர்களா?"
    
    success = trigger_outbound_call(phone_number, message, lang_key)
    return {"status": "success" if success else "failure"}
