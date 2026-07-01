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

def call_farmer_with_price(phone_number: str, language: str, commodity: str, quantity_kg: float, final_price_per_kg: float) -> dict:
    """
    Constructs the localized message and calls Bulbul to notify the farmer.
    """
    lang_key = language if language in FARMER_TEMPLATES else "hi-IN"
    
    template = FARMER_TEMPLATES[lang_key]
    message = template.format(commodity=commodity, price=final_price_per_kg)
    
    success = trigger_outbound_call(phone_number, message, lang_key)
    
    return {
        "status": "success" if success else "failure",
        "message_used": message
    }


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

