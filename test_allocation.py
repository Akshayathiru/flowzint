import sys
import os

# Add backend directory to sys.path so we can import from it
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))


from database import SessionLocal, engine, Base
from models import Pool, Buyer, Offer, Farmer, PoolMember

from services.pooling_engine import close_pool

def run_test():
    # Setup fresh tables
    engine.dispose()
    for p in ['backend/mandi.db', 'mandi.db']:
        if os.path.exists(p):
            try:
                os.remove(p)
            except Exception:
                pass
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()

    
    # Clean up previous tests
    db.query(Offer).delete()
    db.query(Buyer).delete()
    db.query(PoolMember).delete()
    db.query(Farmer).delete()
    db.query(Pool).delete()
    db.commit()

    # 1. Create a pool of 820 kg
    pool = Pool(crop="tomato", location="kanchipuram", total_quantity=820.0, status="CLOSED")
    db.add(pool)
    db.commit()
    db.refresh(pool)

    # 2. Create pool members and farmers
    farmer_1 = Farmer(phone="+919876543210", name="Ravi Kumar", trust_score=87, transaction_count=23)
    farmer_2 = Farmer(phone="+919876543211", name="Anil Kumar", trust_score=80, transaction_count=9)
    db.add_all([farmer_1, farmer_2])
    db.commit()

    member_1 = PoolMember(pool_id=pool.id, farmer_phone=farmer_1.phone, quantity=500.0, delivered="PENDING")
    member_2 = PoolMember(pool_id=pool.id, farmer_phone=farmer_2.phone, quantity=320.0, delivered="PENDING")
    db.add_all([member_1, member_2])
    db.commit()
    
    # 3. Create buyers C, A, B
    buyer_c = Buyer(name="Buyer C", phone="999", crop="tomato", location="kanchipuram", min_quantity=10, suspended=False)
    buyer_a = Buyer(name="Buyer A", phone="888", crop="tomato", location="kanchipuram", min_quantity=10, suspended=False)
    buyer_b = Buyer(name="Buyer B", phone="777", crop="tomato", location="kanchipuram", min_quantity=10, suspended=False)
    db.add_all([buyer_c, buyer_a, buyer_b])
    db.commit()
    
    # 4. Submit bids (C: 320kg @ 17, A: 200kg @ 16, B: 300kg @ 15)
    offer_c = Offer(buyer_id=buyer_c.id, pool_id=pool.id, price=17.0, quantity=320.0, status="PENDING", allocated_quantity=0.0)
    offer_a = Offer(buyer_id=buyer_a.id, pool_id=pool.id, price=16.0, quantity=200.0, status="PENDING", allocated_quantity=0.0)
    offer_b = Offer(buyer_id=buyer_b.id, pool_id=pool.id, price=15.0, quantity=300.0, status="PENDING", allocated_quantity=0.0)
    db.add_all([offer_c, offer_a, offer_b])
    db.commit()


    # 4. Run Allocation Engine
    print("Running close_pool...")
    result = close_pool(db, pool.id)
    
    # 5. Check Results
    print("Allocation Results:", result)
    
    for alloc in result.get("allocations", []):
        buyer = db.query(Buyer).filter(Buyer.id == alloc["buyer_id"]).first()
        print(f"{buyer.name} got {alloc['allocated_quantity']} kg at Rs. {alloc['price']}")


    db.close()

if __name__ == "__main__":
    run_test()
