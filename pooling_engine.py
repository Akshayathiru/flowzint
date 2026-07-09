import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

# State format:
# {
#   "tomato": {
#      "total_kg": 10.0,
#      "threshold_kg": 50.0,
#      "farmers": [{"phone": "+1", "kg": 10.0, "expected_price": 18.0, "language": "ta-IN", "status": "pending_pool"}],
#      "status": "collecting", # collecting, farmer_confirming, buyer_bidding
#      "minimum_price": None
#   }
# }
pools: Dict[str, Any] = {
    "tomato": {
        "total_kg": 40.0,
        "threshold_kg": 50.0,
        "farmers": [
            {"phone": "+919876543210", "kg": 20.0, "expected_price": 22.0, "language": "ta-IN", "status": "pending"},
            {"phone": "+919876543211", "kg": 20.0, "expected_price": 21.5, "language": "hi-IN", "status": "confirmed"}
        ],
        "status": "collecting",
        "minimum_price": None
    }
}
user_languages: Dict[str, str] = {} # phone -> language (ta-IN, en-IN, hi-IN)

def set_user_language(phone: str, lang: str):
    user_languages[phone] = lang

def get_user_language(phone: str) -> str:
    return user_languages.get(phone, "hi-IN") # default hindi

def init_pool_if_not_exists(commodity: str, threshold_kg: float = 50.0):
    if commodity not in pools:
        pools[commodity] = {
            "total_kg": 0.0,
            "threshold_kg": threshold_kg,
            "farmers": [],
            "status": "collecting",
            "minimum_price": None
        }

def add_farmer_to_pool(commodity: str, phone: str, quantity_kg: float, expected_price: float, language: str) -> dict:
    """
    Adds a farmer to a pool.
    Returns the pool state.
    """
    init_pool_if_not_exists(commodity)
    pool = pools[commodity]
    
    # Simple deduplication by phone
    existing = next((f for f in pool["farmers"] if f["phone"] == phone), None)
    if existing:
        # Update existing
        pool["total_kg"] -= existing["kg"]
        existing["kg"] = quantity_kg
        existing["expected_price"] = expected_price
        existing["language"] = language
    else:
        pool["farmers"].append({
            "phone": phone,
            "kg": quantity_kg,
            "expected_price": expected_price,
            "language": language,
            "status": "pending_pool"
        })
        
    pool["total_kg"] += quantity_kg
    logger.info(f"Added farmer {phone} to {commodity} pool. Total: {pool['total_kg']} kg")
    return pool

def check_threshold(commodity: str) -> Optional[float]:
    """
    Checks if threshold is met. If yes, changes status to farmer_confirming,
    calculates average expected price (minimum price), and returns it.
    """
    if commodity not in pools:
        return None
        
    pool = pools[commodity]
    if pool["status"] == "collecting" and pool["total_kg"] >= pool["threshold_kg"]:
        pool["status"] = "farmer_confirming"
        total_price = sum(f["expected_price"] * f["kg"] for f in pool["farmers"])
        pool["minimum_price"] = round(total_price / pool["total_kg"], 2)
        logger.info(f"Threshold met for {commodity}. Minimum price: {pool['minimum_price']}")
        return pool["minimum_price"]
        
    return None

def update_farmer_status(commodity: str, phone: str, status: str):
    if commodity in pools:
        for f in pools[commodity]["farmers"]:
            if f["phone"] == phone:
                f["status"] = status
                return True
    return False

def all_farmers_confirmed(commodity: str) -> bool:
    if commodity not in pools:
        return False
    return all(f["status"] == "confirmed" for f in pools[commodity]["farmers"])

def get_pool(commodity: str) -> Optional[dict]:
    return pools.get(commodity)
