import requests  # type: ignore
import os
import json
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_URL = "http://localhost:8000"

def run_test_flow():
    # Make sure we have a dummy file
    dummy_audio_path = "test_samples/sample_ta.wav"
    os.makedirs(os.path.dirname(dummy_audio_path), exist_ok=True)
    if not os.path.exists(dummy_audio_path):
        with open(dummy_audio_path, "wb") as f:
            f.write(b"dummy audio content")

    logger.info("=== STEP 1: Inbound Call ===")
    data = {
        "From": "+919876543210",
        "RecordingUrl": "http://api.twilio.com/2010-04-01/Accounts/ACxxx/Recordings/RExxx"
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/inbound-call", data=data)
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "")
        if "xml" in content_type:
            logger.info("Inbound Call TwiML Response:")
            logger.info(resp.text)
        else:
            inbound_result = resp.json()
            logger.info("Inbound Call Response:")
            logger.info(json.dumps(inbound_result, indent=2))
    except Exception as e:
        logger.error(f"Inbound call failed: {e}")
        return

    time.sleep(1)

    logger.info("\n=== STEP 2: Pool Closes -> Callback Farmer ===")
    farmer_data = {
        "phone_number": "+919876543210",
        "language": "ta-IN",
        "commodity": "tomato",
        "quantity_kg": 200.0,
        "final_price_per_kg": 25.5
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/callback/farmer", json=farmer_data)
        resp.raise_for_status()
        farmer_result = resp.json()
        logger.info("Farmer Callback Response:")
        logger.info(json.dumps(farmer_result, indent=2))
    except Exception as e:
        logger.error(f"Farmer callback failed: {e}")

    time.sleep(1)

    logger.info("\n=== STEP 3: Callback Buyers ===")
    buyers = ["+919998887776", "+919998887775"]
    
    for buyer_phone in buyers:
        buyer_data = {
            "phone_number": buyer_phone,
            "commodity": "tomato",
            "quantity_kg": 200.0,
            "mandi_rate": 28.0,
            "location": "Krishnagiri",
            "ask_for_counteroffer": True
        }
        
        try:
            resp = requests.post(f"{BASE_URL}/callback/buyer", json=buyer_data)
            resp.raise_for_status()
            buyer_result = resp.json()
            logger.info(f"Buyer Callback Response ({buyer_phone}):")
            logger.info(json.dumps(buyer_result, indent=2))
        except Exception as e:
            logger.error(f"Buyer callback failed: {e}")

if __name__ == "__main__":
    logger.info("Starting test flow. Ensure FastAPI server is running on port 8000")
    run_test_flow()
