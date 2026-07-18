import os
import sys
from datetime import datetime, timedelta, timezone

# Add parent and current dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_path not in sys.path:
    sys.path.append(root_path)

from database import SessionLocal, engine, Base
from models import Farmer, Pool, PoolMember, Buyer, Offer, Allocation, PickupManifest


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def seed_database():
    print("Seeding Mandi Mitra Database...")
    db = SessionLocal()

    try:
        # Create tables if not exist
        Base.metadata.create_all(bind=engine)

        # Clear existing data for a clean seed
        db.query(Allocation).delete()
        db.query(PickupManifest).delete()
        db.query(Offer).delete()
        db.query(PoolMember).delete()
        db.query(Pool).delete()
        db.query(Buyer).delete()
        db.query(Farmer).delete()
        db.commit()

        # 1. Farmers
        farmers_data = [
            {"phone": "+919876543210", "name": "Ramesh Kumar", "trust_score": 95, "success_count": 12, "no_show_count": 0, "transaction_count": 12},
            {"phone": "+919712345678", "name": "Selvam Pitchai", "trust_score": 90, "success_count": 8, "no_show_count": 1, "transaction_count": 9},
            {"phone": "+919600570633", "name": "Murugan Thangavel", "trust_score": 100, "success_count": 15, "no_show_count": 0, "transaction_count": 15},
            {"phone": "+919543218765", "name": "Lakshmi Sundaram", "trust_score": 85, "success_count": 5, "no_show_count": 1, "transaction_count": 6},
            {"phone": "+919443322110", "name": "Anbu Chelliam", "trust_score": 98, "success_count": 10, "no_show_count": 0, "transaction_count": 10},
            {"phone": "+919334455667", "name": "Rajesh Patel", "trust_score": 92, "success_count": 7, "no_show_count": 0, "transaction_count": 7},
        ]
        for f in farmers_data:
            db.add(Farmer(**f))
        db.commit()
        print("Farmers seeded")

        # 2. Buyers
        buyers_data = [
            {"name": "Ramesh Traders", "phone": "+919988776655", "crop": "tomato", "location": "Kanchipuram", "min_quantity": 100.0, "trust_score": 98, "transaction_count": 24, "no_show_count": 0},
            {"name": "Sri Lakshmi Wholesale", "phone": "+919887766554", "crop": "onion", "location": "Vellore", "min_quantity": 150.0, "trust_score": 95, "transaction_count": 18, "no_show_count": 0},
            {"name": "Murugan Agro", "phone": "+919776655443", "crop": "potato", "location": "Chengalpattu", "min_quantity": 200.0, "trust_score": 92, "transaction_count": 14, "no_show_count": 1},
            {"name": "Nilgiri Organics", "phone": "+919665544332", "crop": "chilli", "location": "Salem", "min_quantity": 50.0, "trust_score": 99, "transaction_count": 30, "no_show_count": 0},
            {"name": "Kovai Fresh Produce", "phone": "+919554433221", "crop": "brinjal", "location": "Tiruvannamalai", "min_quantity": 100.0, "trust_score": 90, "transaction_count": 10, "no_show_count": 0},
        ]
        buyers = []
        for b in buyers_data:
            buyer_obj = Buyer(**b)
            db.add(buyer_obj)
            db.flush()
            buyers.append(buyer_obj)
        db.commit()
        print("Buyers seeded")

        now = utcnow()

        # 3. Pools
        p1 = Pool(crop="tomato", location="Kanchipuram", total_quantity=350.0, status="AUCTION", current_highest_bid=18.5, auction_start_time=now - timedelta(minutes=10), auction_end_time=now + timedelta(minutes=20))
        p2 = Pool(crop="onion", location="Vellore", total_quantity=280.0, status="AUCTION", current_highest_bid=22.0, auction_start_time=now - timedelta(minutes=15), auction_end_time=now + timedelta(minutes=15))
        p3 = Pool(crop="potato", location="Chengalpattu", total_quantity=180.0, status="OPEN", current_highest_bid=14.0)
        p4 = Pool(crop="chilli", location="Salem", total_quantity=420.0, status="SETTLED", current_highest_bid=48.0, winning_price=48.0, winning_buyer_id=buyers[3].id, closed_at=now - timedelta(hours=3))
        p5 = Pool(crop="brinjal", location="Tiruvannamalai", total_quantity=310.0, status="SETTLED", current_highest_bid=16.5, winning_price=16.5, winning_buyer_id=buyers[4].id, closed_at=now - timedelta(days=1))

        for p in [p1, p2, p3, p4, p5]:
            db.add(p)
            db.flush()
        db.commit()
        print("Pools seeded")

        # 4. Pool Members
        members_data = [
            # Pool 1 (Tomato)
            {"pool_id": p1.id, "farmer_phone": "+919876543210", "quantity": 150.0, "delivered": "PENDING", "crop_quality_grade": "A"},
            {"pool_id": p1.id, "farmer_phone": "+919712345678", "quantity": 120.0, "delivered": "PENDING", "crop_quality_grade": "A"},
            {"pool_id": p1.id, "farmer_phone": "+919600570633", "quantity": 80.0, "delivered": "PENDING", "crop_quality_grade": "B"},
            # Pool 2 (Onion)
            {"pool_id": p2.id, "farmer_phone": "+919543218765", "quantity": 140.0, "delivered": "PENDING", "crop_quality_grade": "B"},
            {"pool_id": p2.id, "farmer_phone": "+919443322110", "quantity": 140.0, "delivered": "PENDING", "crop_quality_grade": "A"},
            # Pool 3 (Potato)
            {"pool_id": p3.id, "farmer_phone": "+919334455667", "quantity": 180.0, "delivered": "PENDING", "crop_quality_grade": "B"},
            # Pool 4 (Chilli - Settled)
            {"pool_id": p4.id, "farmer_phone": "+919876543210", "quantity": 220.0, "delivered": "YES", "crop_quality_grade": "A"},
            {"pool_id": p4.id, "farmer_phone": "+919600570633", "quantity": 200.0, "delivered": "YES", "crop_quality_grade": "A"},
            # Pool 5 (Brinjal - Settled)
            {"pool_id": p5.id, "farmer_phone": "+919712345678", "quantity": 160.0, "delivered": "YES", "crop_quality_grade": "B"},
            {"pool_id": p5.id, "farmer_phone": "+919443322110", "quantity": 150.0, "delivered": "YES", "crop_quality_grade": "A"},
        ]
        for m in members_data:
            db.add(PoolMember(**m))
        db.commit()
        print("Pool Members seeded")

        # 5. Offers / Bids
        offers_data = [
            {"buyer_id": buyers[0].id, "pool_id": p1.id, "price": 18.5, "quantity": 350.0, "status": "PENDING", "allocated_quantity": 0.0, "timestamp": now - timedelta(minutes=5)},
            {"buyer_id": buyers[1].id, "pool_id": p1.id, "price": 17.0, "quantity": 200.0, "status": "PENDING", "allocated_quantity": 0.0, "timestamp": now - timedelta(minutes=8)},
            {"buyer_id": buyers[1].id, "pool_id": p2.id, "price": 22.0, "quantity": 280.0, "status": "PENDING", "allocated_quantity": 0.0, "timestamp": now - timedelta(minutes=10)},
            {"buyer_id": buyers[3].id, "pool_id": p4.id, "price": 48.0, "quantity": 420.0, "status": "WON", "allocated_quantity": 420.0, "timestamp": now - timedelta(hours=3)},
            {"buyer_id": buyers[4].id, "pool_id": p5.id, "price": 16.5, "quantity": 310.0, "status": "WON", "allocated_quantity": 310.0, "timestamp": now - timedelta(days=1)},
        ]
        for o in offers_data:
            db.add(Offer(**o))
        db.commit()
        print("Offers seeded")

        # 6. Settled Allocations
        allocs_data = [
            {
                "pool_id": p4.id,
                "farmer_phone": "+919876543210",
                "farmer_name": "Ramesh Kumar",
                "buyer_id": buyers[3].id,
                "buyer_name": "Nilgiri Organics",
                "quantity": 220.0,
                "price_per_kg": 48.0,
                "confirmation_status": "accepted",
                "payment_status": "received",
                "payment_sent_at": now - timedelta(hours=2),
                "payment_received_at": now - timedelta(hours=1),
            },
            {
                "pool_id": p4.id,
                "farmer_phone": "+919600570633",
                "farmer_name": "Murugan Thangavel",
                "buyer_id": buyers[3].id,
                "buyer_name": "Nilgiri Organics",
                "quantity": 200.0,
                "price_per_kg": 48.0,
                "confirmation_status": "accepted",
                "payment_status": "sent",
                "payment_sent_at": now - timedelta(hours=2),
            },
            {
                "pool_id": p5.id,
                "farmer_phone": "+919712345678",
                "farmer_name": "Selvam Pitchai",
                "buyer_id": buyers[4].id,
                "buyer_name": "Kovai Fresh Produce",
                "quantity": 160.0,
                "price_per_kg": 16.5,
                "confirmation_status": "accepted",
                "payment_status": "received",
                "payment_sent_at": now - timedelta(days=1),
                "payment_received_at": now - timedelta(hours=20),
            },
            {
                "pool_id": p5.id,
                "farmer_phone": "+919443322110",
                "farmer_name": "Anbu Chelliam",
                "buyer_id": buyers[4].id,
                "buyer_name": "Kovai Fresh Produce",
                "quantity": 150.0,
                "price_per_kg": 16.5,
                "confirmation_status": "accepted",
                "payment_status": "received",
                "payment_sent_at": now - timedelta(days=1),
                "payment_received_at": now - timedelta(hours=18),
            },
        ]
        for a in allocs_data:
            db.add(Allocation(**a))
        db.commit()
        print("Allocations seeded")

        # 7. Pickup Manifests
        manifests_data = [
            {"pool_id": p4.id, "buyer_id": buyers[3].id, "buyer_name": "Nilgiri Organics", "allocated_quantity": 420.0, "farmer_contacts": "+919876543210, +919600570633", "pickup_location": "Salem"},
            {"pool_id": p5.id, "buyer_id": buyers[4].id, "buyer_name": "Kovai Fresh Produce", "allocated_quantity": 310.0, "farmer_contacts": "+919712345678, +919443322110", "pickup_location": "Tiruvannamalai"},
        ]
        for m in manifests_data:
            db.add(PickupManifest(**m))
        db.commit()
        print("Pickup Manifests seeded")

        print("MANDI MITRA DATABASE SEEDED SUCCESSFULLY!")

    except Exception as e:
        db.rollback()
        print(f"Database seeding failed: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
