import os
import requests
import logging
import time
from typing import Callable, TypeVar
from dotenv import load_dotenv

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")
MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"
SAARAS_URL = "https://api.sarvam.ai/speech-to-text-translate"
BULBUL_URL = "https://api.sarvam.ai/text-to-speech"

logger = logging.getLogger(__name__)

T = TypeVar('T')

def with_retry(fn: Callable[[], T], retries: int = 3) -> T:
    if retries <= 0:
        raise ValueError("retries must be greater than 0")
    for attempt in range(retries):
        try:
            return fn()
        except Exception as e:
            if attempt < retries - 1:
                wait = 2 ** attempt  # 1s, 2s, 4s
                logger.warning(
                    f"Sarvam API attempt {attempt+1} failed: {e}."
                    f" Retrying in {wait}s..."
                )
                time.sleep(wait)
            else:
                raise
    raise RuntimeError("Unexpected end of retry loop")

class SarvamClient:
    async def transcribe_audio(self, audio_url: str) -> str:
        if MOCK_MODE:
            logger.info(f"[MOCK] Transcribing audio from {audio_url}")
            return "I am a farmer from kanchipuram named test farmer with 200 kg tomato."
            
        def _call():
            logger.info(f"Downloading audio from Twilio: {audio_url}")
            audio_response = requests.get(audio_url)
            audio_response.raise_for_status()
            audio_bytes = audio_response.content

            headers = {
                "api-subscription-key": SARVAM_API_KEY
            }
            files = {
                'file': ('audio.wav', audio_bytes, 'audio/wav')
            }
            data = {
                'language_code': 'hi-IN',
                'model': 'saaras:v2.5'
            }
            response = requests.post(SAARAS_URL, headers=headers, files=files, data=data)
            response.raise_for_status()
            result = response.json()
            return result.get("transcript", "")

        return with_retry(_call)

    async def chat(self, system: str, messages: list) -> dict:
        if MOCK_MODE:
            logger.info("[MOCK] Chatting with Sarvam LLM")
            return {"reply": "CONFIRMED:test farmer:tomato:200:kanchipuram"}
            
        def _call():
            response = requests.post(
                "https://api.sarvam.ai/v1/chat",
                headers={"api-subscription-key": SARVAM_API_KEY},
                json={
                    "model": "sarvam-2",
                    "system": system,
                    "messages": messages
                }
            )
            response.raise_for_status()
            return {
                "reply": response.json()["choices"][0]["message"]["content"]
            }

        return with_retry(_call)

    async def text_to_speech(self, text: str, language: str = "hi-IN") -> bytes:
        if MOCK_MODE:
            logger.info(f"[MOCK] TTS for text: {text}")
            return b"dummy audio content"
            
        def _call():
            response = requests.post(
                "https://api.sarvam.ai/text-to-speech",
                headers={"api-subscription-key": SARVAM_API_KEY},
                json={
                    "text": text,
                    "target_language_code": language,
                    "speaker": "meera",
                    "pace": 1.0
                }
            )
            response.raise_for_status()
            return response.content

        return with_retry(_call)

sarvam_client = SarvamClient()

# Maintain legacy sync functions for compatibility
def transcribe_audio(audio_bytes: bytes, phone_number: str) -> dict:
    headers = {
        "api-subscription-key": SARVAM_API_KEY
    }
    files = {
        'file': ('audio.wav', audio_bytes, 'audio/wav')
    }
    data = {
        'language_code': 'hi-IN',
        'model': 'saaras:v2.5'
    }
    def _call():
        response = requests.post(SAARAS_URL, headers=headers, files=files, data=data)
        if not response.ok:
            logger.error(f"Sarvam STT API Error: {response.text}")
        response.raise_for_status()
        result = response.json()
        return {
            "transcript": result.get("transcript", ""),
            "language_code": result.get("language_code", "hi-IN")
        }
    return with_retry(_call)

def trigger_outbound_call(phone_number: str, message: str, language: str) -> bool:
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
        "speaker": "ritu", # updated from anushka to a valid v3 speaker
        "pace": 1.0,
        "speech_sample_rate": 8000,
        "enable_preprocessing": True,
        "model": "bulbul:v3"
    }
    
    try:
        def _call():
            response = requests.post(BULBUL_URL, headers=headers, json=payload)
            if not response.ok:
                logger.error(f"Sarvam API Error: {response.text}")
            response.raise_for_status()
            return True
        return with_retry(_call)
    except Exception as e:
        logger.error(f"Error triggering Bulbul outbound call: {e}")
        return False

