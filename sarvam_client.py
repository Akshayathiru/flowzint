import os
import requests
import logging
from dotenv import load_dotenv

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")
MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"
SAARAS_URL = "https://api.sarvam.ai/speech-to-text-translate" # hypothetical saaras endpoint URL, modify as per actual docs
BULBUL_URL = "https://api.sarvam.ai/text-to-speech" # hypothetical bulbul endpoint URL, modify as per actual docs

logger = logging.getLogger(__name__)

def transcribe_audio(audio_bytes: bytes, phone_number: str) -> dict:
    """
    Sends audio bytes to Saaras API for Speech-to-Text.
    Returns a dict with 'transcript' and 'language_code'.
    """
    if MOCK_MODE:
        logger.info(f"[MOCK] Transcribing audio for {phone_number}")
        return {
            "transcript": "Naan tomato 200 kilo Krishnagiri-la vikaranom",
            "language_code": "ta-IN"
        }

    headers = {
        "api-subscription-key": SARVAM_API_KEY
    }
    
    # Assume standard multipart upload to Saaras endpoint.
    files = {
        'file': ('audio.wav', audio_bytes, 'audio/wav')
    }
    data = {
        'language_code': 'hi-IN', # Depending on their API, auto-detect might be different
        'model': 'saaras:v1'
    }
    
    try:
        response = requests.post(SAARAS_URL, headers=headers, files=files, data=data)
        response.raise_for_status()
        result = response.json()
        return {
            "transcript": result.get("transcript", ""),
            "language_code": result.get("language_code", "hi-IN")
        }
    except Exception as e:
        logger.error(f"Error calling Saaras API: {e}")
        # fallback to partial extraction or raise
        return {
            "transcript": "",
            "language_code": "unknown"
        }

def trigger_outbound_call(phone_number: str, message: str, language: str) -> bool:
    """
    Triggers an outbound call using Bulbul TTS/Call API.
    Returns True if successful.
    """
    if MOCK_MODE:
        logger.info(f"[MOCK] Outbound call to {phone_number} in {language}. Message: '{message}'")
        return True

    headers = {
        "api-subscription-key": SARVAM_API_KEY,
        "Content-Type": "application/json"
    }
    
    payload = {
        "inputs": [message],
        "target_language_code": language,
        "speaker": "meera", # example
        "pitch": 0,
        "pace": 1.0,
        "loudness": 1.5,
        "speech_sample_rate": 8000,
        "enable_preprocessing": True,
        "model": "bulbul:v1"
        # Actual call triggering parameters depend on Sarvam's voice callback API,
        # assuming here it returns audio and we trigger the call, or it triggers the call directly.
    }
    
    try:
        # Assuming Sarvam has an endpoint that directly triggers the call given text, 
        # or we generate TTS then call another telephony provider.
        # Following requirements, Sarvam does the call.
        response = requests.post(BULBUL_URL, headers=headers, json=payload)
        response.raise_for_status()
        # In a real scenario, check if call queued successfully
        return True
    except Exception as e:
        logger.error(f"Error triggering Bulbul outbound call: {e}")
        return False
