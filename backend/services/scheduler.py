from apscheduler.schedulers.background import BackgroundScheduler
from database import SessionLocal
from models import Pool
from services.pooling_engine import close_pool, handle_pool_timeout
from datetime import datetime, timezone
import logging
import os

logger = logging.getLogger(__name__)

def check_expired_auctions():
    """Find pools in AUCTION state whose end time has passed and close them."""
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        expired_auctions = db.query(Pool).filter(
            Pool.status == "AUCTION",
            Pool.auction_end_time <= now
        ).all()
        for pool in expired_auctions:
            logger.info(f"Scheduler closing expired auction pool: {pool.id}")
            try:
                close_pool(db, pool.id)
            except Exception as e:
                logger.error(f"Error closing pool {pool.id}: {e}")
    finally:
        db.close()

def check_expired_pools():
    """Find pools in OPEN state whose max-wait window has passed and process them."""
    db = SessionLocal()
    try:
        max_wait_hours = float(os.getenv("MAX_WAIT_HOURS", "48.0"))
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        expired_open_pools = db.query(Pool).filter(
            Pool.status == "OPEN"
        ).all()
        
        for pool in expired_open_pools:
            if pool.created_at:
                elapsed = (now - pool.created_at).total_seconds()
                if elapsed >= (max_wait_hours * 3600):
                    logger.info(f"Scheduler processing timeout for pool {pool.id}")
                    try:
                        handle_pool_timeout(db, pool.id)
                    except Exception as e:
                        logger.error(f"Error timeout processing for pool {pool.id}: {e}")
    finally:
        db.close()

scheduler = BackgroundScheduler()
scheduler.add_job(check_expired_auctions, 'interval', minutes=5, id="expired_auctions")
scheduler.add_job(check_expired_pools, 'interval', minutes=30, id="expired_pools")

def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        logger.info("Background Scheduler started successfully via start_scheduler wrapper.")

