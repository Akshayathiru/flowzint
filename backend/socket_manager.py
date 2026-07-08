import socketio
import logging

logger = logging.getLogger(__name__)

# Create Async Server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# This will hold the ASGI app once it is wrapped in app.py
socket_app = socketio.ASGIApp(sio)

@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected to socket: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected from socket: {sid}")

@sio.on("demo:trigger_call")  # type: ignore
async def demo_trigger_call(sid, data):
    logger.info(f"Received demo_trigger_call from frontend: {data}")
    # In a real scenario, this might dispatch to the voice layer.
    # Here, we just log it as the frontend also sends a standard POST request for this.

@sio.on("demo:inject_bid")  # type: ignore
async def demo_inject_bid(sid, data):
    logger.info(f"Received demo_inject_bid from frontend: {data}")

from asgiref.sync import async_to_sync

def emit_pool_new(pool_data: dict):
    async_to_sync(sio.emit)("pool:new", pool_data)

def emit_pool_update(pool_id: str, pool_data: dict):
    if "poolId" not in pool_data:
        pool_data["poolId"] = pool_id
    async_to_sync(sio.emit)("pool:update", pool_data)

def emit_pool_settled(pool_id: str, winning_price_per_kg: float, settlement_ids: list):
    async_to_sync(sio.emit)("pool:settled", {
        "poolId": pool_id,
        "winningPricePerKg": winning_price_per_kg,
        "settlementIds": settlement_ids
    })

def emit_feed_event(event_data: dict):
    async_to_sync(sio.emit)("feed:event", event_data)

def emit_pool_bid(pool_id: str, buyer_name: str, price_per_kg: float):
    async_to_sync(sio.emit)(f"pool:{pool_id}:bid", {
        "buyerName": buyer_name,
        "pricePerKg": price_per_kg
    })

def emit_pool_callback(pool_id: str, phone: str, language: str):
    async_to_sync(sio.emit)(f"pool:{pool_id}:callback", {
        "phone": phone,
        "language": language
    })
