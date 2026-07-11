import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from dotenv import load_dotenv
load_dotenv()

print("CWD:", os.getcwd())
print("DATABASE_URL env var:", os.getenv("DATABASE_URL"))
db_url = os.getenv("DATABASE_URL", "")

if db_url.startswith("sqlite:///"):
    path = db_url[len("sqlite:///")]
    abs_path = os.path.abspath(db_url.split("sqlite:///")[1])
    print("Resolved SQLite DB Absolute Path:", abs_path)
    print("File exists?", os.path.exists(abs_path))
    if os.path.exists(abs_path):
        print("File size:", os.path.getsize(abs_path), "bytes")
else:
    print("DB URL is not SQLite or is empty.")
