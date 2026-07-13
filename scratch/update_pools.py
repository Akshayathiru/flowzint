import sqlite3
import os
import sys
from datetime import datetime, timedelta, timezone

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# 1. Update SQLite mandi.db
try:
    sqlite_path = "mandi.db"
    if os.path.exists(sqlite_path):
        conn = sqlite3.connect(sqlite_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, crop, status FROM pools WHERE id IN (1, 2);")
        rows = cursor.fetchall()
        print("SQLite Pools before update:", rows)
        
        cursor.execute("""
            UPDATE pools
            SET status = 'AUCTION',
                auction_start_time = ?,
                auction_end_time = ?,
                winning_price = NULL,
                winning_buyer_id = NULL,
                closed_at = NULL
            WHERE id IN (1, 2);
        """, (
            datetime.now(timezone.utc).replace(tzinfo=None).isoformat(),
            (datetime.now(timezone.utc) + timedelta(hours=24)).replace(tzinfo=None).isoformat()
        ))
        conn.commit()
        print("SQLite update executed.")
        
        cursor.execute("SELECT id, crop, status FROM pools WHERE id IN (1, 2);")
        print("SQLite Pools after update:", cursor.fetchall())
        conn.close()
except Exception as e:
    print("Error updating SQLite mandi.db:", e)

# 2. Update PostgreSQL database
try:
    from backend.database import SessionLocal
    from backend.models import Pool

    db = SessionLocal()
    pools = db.query(Pool).filter(Pool.id.in_([1, 2])).all()
    print("Postgres Pools before update:")
    for pool in pools:
        print(f"ID: {pool.id}, Crop: {pool.crop}, Status: {pool.status}")
        pool.status = "AUCTION"
        pool.auction_start_time = datetime.now(timezone.utc).replace(tzinfo=None)
        pool.auction_end_time = (datetime.now(timezone.utc) + timedelta(hours=24)).replace(tzinfo=None)
        pool.winning_price = None
        pool.winning_buyer_id = None
        pool.closed_at = None
    db.commit()
    print("Postgres update executed.")
    
    pools = db.query(Pool).filter(Pool.id.in_([1, 2])).all()
    print("Postgres Pools after update:")
    for pool in pools:
        print(f"ID: {pool.id}, Crop: {pool.crop}, Status: {pool.status}, End: {pool.auction_end_time}")
    db.close()
except Exception as e:
    print("Error updating Postgres database:", e)
