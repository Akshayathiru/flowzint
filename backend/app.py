from fastapi import FastAPI
from database import engine
from models import Base
from routes import farmer
from routes import buyers
from routes import trust
app.include_router(trust.router)

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(buyers.router)

app.include_router(farmer.router)


@app.get("/")
def home():
    return {"message": "Welcome"}