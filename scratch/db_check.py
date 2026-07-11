import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import SessionLocal
from models import Pool, PoolMember

db = SessionLocal()

phone = "+919876543210"
norm_crop = "tomato"

active_pledge = db.query(PoolMember).join(Pool).filter(
    PoolMember.farmer_phone == phone,
    Pool.crop == norm_crop,
    Pool.status.in_(["OPEN", "PARTIAL_CLOSE", "AUCTION", "CLOSED"])
).first()

if active_pledge:
    pool = db.query(Pool).filter(Pool.id == active_pledge.pool_id).first()
    print("Found active pledge!")
    print(f"Pool ID: {active_pledge.pool_id}, Member ID: {active_pledge.id}, Farmer: {active_pledge.farmer_phone}")
    print(f"Pool status: {pool.status}, Crop: {pool.crop}")
else:
    print("No active pledge found.")

db.close()
