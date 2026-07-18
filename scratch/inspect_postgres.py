import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.database import SessionLocal
from backend.models import Pool, PoolMember, Farmer

db = SessionLocal()
try:
    print("--- Postgres Pools ---")
    pools = db.query(Pool).all()
    for p in pools:
        print(f"ID: {p.id}, Crop: {p.crop}, Location: {p.location}, TotalQty: {p.total_quantity}, Status: {p.status}")
        
    print("\n--- Postgres Pool Members ---")
    members = db.query(PoolMember).all()
    for m in members:
        print(f"ID: {m.id}, PoolID: {m.pool_id}, Phone: {m.farmer_phone}, Quantity: {m.quantity}")
        
    print("\n--- Postgres Farmers ---")
    farmers = db.query(Farmer).all()
    for f in farmers:
        print(f"Phone: {f.phone}, Name: {f.name}")
finally:
    db.close()
