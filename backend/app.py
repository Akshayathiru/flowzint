import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from sqlalchemy import inspect, text
from database import engine
from models import Base
from routes import farmer
from routes import buyers
from routes import trust
from routes import pools
from routes import confirmation
from routes import receipt
from routes import mandi
from routes import stats
from main import router as voice_router


def ensure_pool_schema():
    inspector = inspect(engine)
    Base.metadata.create_all(bind=engine)
    
    # Check farmers table
    if "farmers" in inspector.get_table_names():
        farmers_cols = {column["name"] for column in inspector.get_columns("farmers")}
        with engine.begin() as connection:
            if "transaction_count" not in farmers_cols:
                connection.execute(text("ALTER TABLE farmers ADD COLUMN transaction_count INTEGER DEFAULT 0"))

    # Check pools table
    if "pools" in inspector.get_table_names():
        columns = {column["name"] for column in inspector.get_columns("pools")}
        with engine.begin() as connection:
            if "winning_price" not in columns:
                connection.execute(text("ALTER TABLE pools ADD COLUMN winning_price REAL"))
            if "winning_buyer_id" not in columns:
                connection.execute(text("ALTER TABLE pools ADD COLUMN winning_buyer_id INTEGER"))
            if "closed_at" not in columns:
                connection.execute(text("ALTER TABLE pools ADD COLUMN closed_at DATETIME"))
            if "created_at" not in columns:
                connection.execute(text("ALTER TABLE pools ADD COLUMN created_at DATETIME"))
            if "extended" not in columns:
                connection.execute(text("ALTER TABLE pools ADD COLUMN extended BOOLEAN DEFAULT 0"))
            if "current_highest_bid" not in columns:
                connection.execute(text("ALTER TABLE pools ADD COLUMN current_highest_bid REAL DEFAULT 0.0"))

    # Check pool_members table
    if "pool_members" in inspector.get_table_names():
        members_cols = {column["name"] for column in inspector.get_columns("pool_members")}
        with engine.begin() as connection:
            if "delivered" not in members_cols:
                connection.execute(text("ALTER TABLE pool_members ADD COLUMN delivered TEXT DEFAULT 'PENDING'"))
            if "crop_quality_grade" not in members_cols:
                connection.execute(text("ALTER TABLE pool_members ADD COLUMN crop_quality_grade TEXT"))

    # Check buyers table
    if "buyers" in inspector.get_table_names():
        buyers_cols = {column["name"] for column in inspector.get_columns("buyers")}
        with engine.begin() as connection:
            if "trust_score" not in buyers_cols:
                connection.execute(text("ALTER TABLE buyers ADD COLUMN trust_score INTEGER DEFAULT 100"))
            if "transaction_count" not in buyers_cols:
                connection.execute(text("ALTER TABLE buyers ADD COLUMN transaction_count INTEGER DEFAULT 0"))
            if "no_show_count" not in buyers_cols:
                connection.execute(text("ALTER TABLE buyers ADD COLUMN no_show_count INTEGER DEFAULT 0"))
            if "suspended" not in buyers_cols:
                connection.execute(text("ALTER TABLE buyers ADD COLUMN suspended BOOLEAN DEFAULT 0"))

    # Check offers table
    if "offers" in inspector.get_table_names():
        offers_cols = {column["name"] for column in inspector.get_columns("offers")}
        with engine.begin() as connection:
            if "binding_bid" not in offers_cols:
                connection.execute(text("ALTER TABLE offers ADD COLUMN binding_bid BOOLEAN DEFAULT 1"))



from contextlib import asynccontextmanager
from services.scheduler import scheduler

@asynccontextmanager
async def lifespan(app_instance: FastAPI):
    if not scheduler.running:
        scheduler.start()
    yield
    if scheduler.running:
        scheduler.shutdown()

Base.metadata.create_all(bind=engine)
ensure_pool_schema()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(lifespan=lifespan)


# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(buyers.router)
app.include_router(pools.router)

app.include_router(farmer.router)
app.include_router(trust.router)
app.include_router(confirmation.router)
app.include_router(receipt.router)
app.include_router(mandi.router)
app.include_router(stats.router)
app.include_router(voice_router)

@app.get("/")
def home():
    return {"message": "Welcome"}

@app.get("/healthz")
def health():
    return {"status": "ok"}


from socket_manager import sio
import socketio

# Wrap the FastAPI app with the socketio ASGIApp
app = socketio.ASGIApp(sio, other_asgi_app=app)
