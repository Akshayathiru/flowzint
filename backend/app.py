from fastapi import FastAPI

# Create FastAPI application
app = FastAPI(
    title="Mandi Mitra Backend",
    description="Backend APIs for pooling farmers and buyer auctions",
    version="1.0"
)


# Home API
@app.get("/")
def home():
    return {
        "message": "Welcome to Mandi Mitra Backend"
    }


# Health Check API
@app.get("/health")
def health():
    return {
        "status": "Backend is running"
    }