import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

# Load env from backend/.env
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", ".env")
load_dotenv(dotenv_path)

db_url = os.getenv("DATABASE_URL")
print(f"Attempting to connect to: {db_url}")

try:
    # Use a 5-second connect timeout
    engine = create_engine(db_url, connect_args={"connect_timeout": 5})
    with engine.connect() as conn:
        print("SUCCESS: Connected to PostgreSQL database!")
except Exception as e:
    print(f"FAILED: Connection failed. Error: {e}")
