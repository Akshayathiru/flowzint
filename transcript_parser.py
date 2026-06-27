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
    
    confidence_flag = True
    if not commodity or not quantity_kg or not location:
        confidence_flag = False
        
    return {
        "commodity": commodity,
        "quantity_kg": quantity_kg,
        "location": location,
        "confidence_flag": confidence_flag
    }
