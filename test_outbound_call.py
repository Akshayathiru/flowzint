import os
from dotenv import load_dotenv
from callback_service import call_farmer_with_price

# Load environment variables from .env
load_dotenv()

# We force MOCK_MODE to false here so that the actual call is triggered.
# Note: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER and PUBLIC_URL must be correctly set in .env.
os.environ["MOCK_MODE"] = "false" 

def test_call():
    # Replace with your actual phone number to receive the test call.
    # It must include the country code (e.g., "+919876543210")
    my_phone_number = "+919600570633" 
    
    print(f"Triggering test call to {my_phone_number}...")
    
    result = call_farmer_with_price(
        phone_number=my_phone_number,
        language="hi-IN", # You can try "hi-IN", "ta-IN", "te-IN", or "en-IN"
        commodity="tomato",
        quantity_kg=50.0,
        final_price_per_kg=20.0
    )
    
    print("Call result status:", result.get("status"))
    print("Call triggered successfully!")

if __name__ == "__main__":
    test_call()
