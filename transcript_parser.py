import re
import logging

logger = logging.getLogger(__name__)

# Basic dictionary-based extraction for the hackathon
COMMODITIES = {
    "tomato": "tomato", "tomatoes": "tomato", "tamatar": "tomato", "thakkali": "tomato",
    "onion": "onion", "onions": "onion", "pyaaz": "onion", "vengayam": "onion",
    "rice": "rice", "chawal": "rice", "arisi": "rice"
}

# Add some sample locations
LOCATIONS = ["krishnagiri", "chittoor", "nashik", "pune", "bangalore", "kanchipuram", "vellore", "salem", "chengalpattu", "tiruvannamalai"]

def parse_transcript(transcript: str) -> dict:
    """
    Parses transcript to extract commodity, quantity, and location.
    Returns a dict with extracted fields.
    """
    transcript_lower = transcript.lower()
    
    commodity = None
    for key, val in COMMODITIES.items():
        if key in transcript_lower:
            commodity = val
            break
            
    location = None
    for loc in LOCATIONS:
        if loc in transcript_lower:
            location = loc
            break
            
    # Extract quantity (basic regex for numbers followed by kilo/kg/quintal)
    quantity_kg = None
    
    # regex matches e.g. "200 kilo", "200kg", "5 quintal"
    qty_match = re.search(r'(\d+(?:\.\d+)?)\s*(kilo|kg|quintal|ton)', transcript_lower)
    if qty_match:
        val = float(qty_match.group(1))
        unit = qty_match.group(2)
        if unit == 'quintal':
            quantity_kg = val * 100
        elif unit == 'ton':
            quantity_kg = val * 1000
        else:
            quantity_kg = val
    else:
        # Fallback just find a number
        num_match = re.search(r'(\d+(?:\.\d+)?)', transcript_lower)
        if num_match:
            quantity_kg = float(num_match.group(1))
            # Assume kg if no unit found for safety
    
    # Extract price
    expected_price = None
    price_match = re.search(r'(\d+(?:\.\d+)?)\s*(rupee|rupees|rs|inr)', transcript_lower)
    if price_match:
        expected_price = float(price_match.group(1))
    
    confidence_flag = True
    if not commodity or not quantity_kg or not location or not expected_price:
        confidence_flag = False
        
    return {
        "commodity": commodity,
        "quantity_kg": quantity_kg,
        "location": location,
        "expected_price": expected_price,
        "confidence_flag": confidence_flag
    }


def parse_intent(transcript: str) -> str:
    """
    Parses confirmation intent (yes/no).
    """
    transcript_lower = transcript.lower()
    yes_keywords = ["yes", "correct", "haan", "haanji", "confirm", "right", "sari", "aamaam", "avunu", "yas"]
    no_keywords = ["no", "cancel", "nahin", "wrong", "illai", "kaadhu", "na"]
    
    for kw in yes_keywords:
        if kw in transcript_lower:
            return "yes"
    for kw in no_keywords:
        if kw in transcript_lower:
            return "no"
    return "unknown"


def parse_bid(transcript: str) -> float:
    """
    Parses bid price from transcript.
    """
    transcript_lower = transcript.lower()
    num_match = re.search(r'(\d+(?:\.\d+)?)', transcript_lower)
    if num_match:
        return float(num_match.group(1))
    return 0.0


def parse_rejection_choice(transcript: str) -> str:
    """
    Parses the choice of farmer when they reject.
    """
    transcript_lower = transcript.lower()
    if "market" in transcript_lower or "mandi" in transcript_lower:
        return "market"
    if "pool" in transcript_lower:
        return "pool"
    return "unknown"
