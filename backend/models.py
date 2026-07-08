from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from database import Base
from datetime import datetime, timezone
from sqlalchemy import DateTime


def utcnow_naive():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Farmer(Base):
    __tablename__ = "farmers"

    phone = Column(String, primary_key=True)
    name = Column(String, nullable=True)
    trust_score = Column(Integer, default=100)
    success_count = Column(Integer, default=0)
    no_show_count = Column(Integer, default=0)
    transaction_count = Column(Integer, default=0)



class Pool(Base):
    __tablename__ = "pools"

    id = Column(Integer, primary_key=True, index=True)
    crop = Column(String)
    location = Column(String)
    total_quantity = Column(Float, default=0)
    status = Column(String, default="OPEN")
    created_at = Column(DateTime, default=utcnow_naive)
    extended = Column(Boolean, default=False)
    current_highest_bid = Column(Float, default=0.0)
    auction_start_time = Column(DateTime, nullable=True)
    auction_end_time = Column(DateTime, nullable=True)
    winning_price = Column(Float, nullable=True)
    winning_buyer_id = Column(Integer, nullable=True)
    closed_at = Column(DateTime, nullable=True)


class PoolMember(Base):
    __tablename__ = "pool_members"

    id = Column(Integer, primary_key=True)
    pool_id = Column(Integer, ForeignKey("pools.id"))
    farmer_phone = Column(String)
    quantity = Column(Float)
    delivered = Column(String, default="PENDING")
    crop_quality_grade = Column(String, nullable=True)


class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    phone = Column(String)
    crop = Column(String)
    location = Column(String)
    min_quantity = Column(Float)
    trust_score = Column(Integer, default=100)
    transaction_count = Column(Integer, default=0)
    no_show_count = Column(Integer, default=0)
    suspended = Column(Boolean, default=False)


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True)
    buyer_id = Column(Integer)
    pool_id = Column(Integer)
    price = Column(Float)
    quantity = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=utcnow_naive)
    allocated_quantity = Column(Float, default=0.0)
    status = Column(String, default="PENDING")
    binding_bid = Column(Boolean, default=True)


class TrustScore(Base):
    __tablename__ = "trust_scores"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True)
    score = Column(Float, default=100)


class FarmerConfirmation(Base):
    __tablename__ = "farmer_confirmations"

    id = Column(Integer, primary_key=True, index=True)
    pool_id = Column(Integer)
    phone = Column(String)
    accepted = Column(String)


class PickupManifest(Base):
    __tablename__ = "pickup_manifests"

    id = Column(Integer, primary_key=True, index=True)
    pool_id = Column(Integer)
    buyer_id = Column(Integer)
    buyer_name = Column(String)
    allocated_quantity = Column(Float)
    farmer_contacts = Column(String)
    pickup_location = Column(String)


class Allocation(Base):
    __tablename__ = "allocations"

    id = Column(Integer, primary_key=True, index=True)
    pool_id = Column(Integer)
    farmer_phone = Column(String)
    farmer_name = Column(String, nullable=True)
    buyer_id = Column(Integer)
    buyer_name = Column(String)
    quantity = Column(Float)
    price_per_kg = Column(Float)
