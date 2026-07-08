import os
from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv()

def trigger_outbound():
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_phone = os.getenv("TWILIO_PHONE_NUMBER")
    base_url = os.getenv("BASE_URL")
    
    # Target phone number (user's mobile)
    to_phone = "+919600570633" 
    
    if not account_sid or not auth_token or not from_phone:
        print("Error: Missing Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) in your .env file.")
        print("Please add them to your .env file and try again.")
        return
        
    if not base_url:
        print("Error: BASE_URL not found in .env.")
        return

    client = Client(account_sid, auth_token)
    
    # You can change this to test different languages (hi-IN, ta-IN, te-IN, en-IN)
    language = "ta-IN" 
    
    twiml_url = f"{base_url}/twilio/outbound-confirm-twiml?commodity=tomato&price=22.5&language={language}"
    print(f"Placing outbound call from {from_phone} to {to_phone}...")
    print(f"Using TwiML URL: {twiml_url}")
    
    try:
        call = client.calls.create(
            to=to_phone,
            from_=from_phone,
            url=twiml_url
        )
        print(f"Call successfully placed! Twilio Call SID: {call.sid}")
    except Exception as e:
        print(f"Failed to place call: {e}")

if __name__ == "__main__":
    trigger_outbound()
