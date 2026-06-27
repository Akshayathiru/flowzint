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


def ensure_pool_schema():
    inspector = inspect(engine)
    if "pools" not in inspector.get_table_names():
        Base.metadata.create_all(bind=engine)
        return

    columns = {column["name"] for column in inspector.get_columns("pools")}

    with engine.begin() as connection:
        if "winning_price" not in columns:
            connection.execute(text("ALTER TABLE pools ADD COLUMN winning_price REAL"))
        if "winning_buyer_id" not in columns:
            connection.execute(text("ALTER TABLE pools ADD COLUMN winning_buyer_id INTEGER"))
        if "closed_at" not in columns:
            connection.execute(text("ALTER TABLE pools ADD COLUMN closed_at DATETIME"))


Base.metadata.create_all(bind=engine)
ensure_pool_schema()

app = FastAPI()
app.include_router(buyers.router)
app.include_router(pools.router)

app.include_router(farmer.router)
app.include_router(trust.router)
app.include_router(confirmation.router)
app.include_router(receipt.router)


@app.get("/")
def home():
    return {"message": "Welcome"}