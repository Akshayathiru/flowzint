# Voice & Language Layer

This is the Voice & Language Layer for the farmer price-pooling platform, handling Sarvam AI's Speech-to-Text (Saaras) and Text-to-Speech (Bulbul) integration.

## Setup

1. Install dependencies:
   ```bash
   pip install fastapi uvicorn pydantic requests python-dotenv python-multipart
   ```
2. Copy the environment variables template and add your keys:
   ```bash
   cp .env.example .env
   ```
   *Note: Set `MOCK_MODE=true` to test without a valid Sarvam API key.*

## Running the API

Start the FastAPI development server:
```bash
cd voice_layer
uvicorn main:app --reload
```
The server will run at `http://127.0.0.1:8000`.

## Testing

With the server running, open another terminal and run the test script to simulate the entire flow:
```bash
cd voice_layer
python test_flow.py
```
This will test the `/inbound-call`, `/callback/farmer`, and `/callback/buyer` endpoints.
