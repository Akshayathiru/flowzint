import sys
import os

# Add backend directory to sys.path so we can import from it
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from database import SessionLocal, engine
from models import Base, Pool, Buyer, Offer
from services.pooling_engine import close_pool

def run_test():
    # Setup fresh tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Clean up previous tests
    db.query(Offer).delete()
    db.query(Buyer).delete()
    db.query(Pool).delete()
    db.commit()

    # 1. Create a pool of 820 kg
    pool = Pool(crop="tomato", location="kanchipuram", total_quantity=820.0, status="CLOSED")
    db.add(pool)
    db.commit()
    db.refresh(pool)
    
    # 2. Create buyers C, A, B
    buyer_c = Buyer(name="Buyer C", phone="999", crop="tomato", location="kanchipuram", min_quantity=10)
    buyer_a = Buyer(name="Buyer A", phone="888", crop="tomato", location="kanchipuram", min_quantity=10)
    buyer_b = Buyer(name="Buyer B", phone="777", crop="tomato", location="kanchipuram", min_quantity=10)
    db.add_all([buyer_c, buyer_a, buyer_b])
    db.commit()
    
    # 3. Submit bids (C: 320kg @ 17, A: 200kg @ 16, B: 300kg @ 15)
    offer_c = Offer(buyer_id=buyer_c.id, pool_id=pool.id, price=17.0, quantity=320.0, status="PENDING")
    offer_a = Offer(buyer_id=buyer_a.id, pool_id=pool.id, price=16.0, quantity=200.0, status="PENDING")
    offer_b = Offer(buyer_id=buyer_b.id, pool_id=pool.id, price=15.0, quantity=300.0, status="PENDING")
    db.add_all([offer_c, offer_a, offer_b])
    db.commit()

    # 4. Run Allocation Engine
    print("Running close_pool...")
    result = close_pool(db, pool.id)
    
    # 5. Check Results
    print("Allocation Results:", result)
    
    for alloc in result.get("allocations", []):
        buyer = db.query(Buyer).filter(Buyer.id == alloc["buyer_id"]).first()
        print(f"{buyer.name} got {alloc['allocated_quantity']} kg at ₹{alloc['price']}")

    db.close()

if __name__ == "__main__":
    run_test()
