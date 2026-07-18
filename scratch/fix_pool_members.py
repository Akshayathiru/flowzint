import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.database import SessionLocal
from backend.models import Pool, PoolMember, Farmer

db = SessionLocal()
try:
    pool = db.query(Pool).filter(Pool.id == 2).first()
    if pool:
        print(f"Found Pool 2: {pool.crop}, total_quantity: {pool.total_quantity}")
        
        member = db.query(PoolMember).filter(PoolMember.pool_id == 2).first()
        if member:
            print(f"Pool member already exists: {member.farmer_phone}, qty: {member.quantity}")
        else:
            farmer = db.query(Farmer).filter(Farmer.phone == '+918888877777').first()
            if not farmer:
                farmer = Farmer(phone='+918888877777', name='Anbazhagan', trust_score=100)
                db.add(farmer)
                db.flush()
                print("Created farmer +918888877777")
                
            new_member = PoolMember(
                pool_id=2,
                farmer_phone=farmer.phone,
                quantity=20.0,
                delivered='PENDING'
            )
            db.add(new_member)
            db.commit()
            print("Successfully added pool member to Pool 2!")
    else:
        print("Pool 2 not found in Postgres database!")
        
except Exception as e:
    print("Error during update:", e)
finally:
    db.close()
