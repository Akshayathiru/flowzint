from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database import Base


class Farmer(Base):
    __tablename__ = "farmers"

    phone = Column(String, primary_key=True)
    trust_score = Column(Integer, default=100)
    success_count = Column(Integer, default=0)
    no_show_count = Column(Integer, default=0)


class Pool(Base):
    __tablename__ = "pools"

    id = Column(Integer, primary_key=True, index=True)
    crop = Column(String)
    location = Column(String)
    total_quantity = Column(Float, default=0)
    status = Column(String, default="OPEN")


class PoolMember(Base):
    __tablename__ = "pool_members"

    id = Column(Integer, primary_key=True)
    pool_id = Column(Integer, ForeignKey("pools.id"))
    farmer_phone = Column(String)
    quantity = Column(Float)


class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    phone = Column(String)
    crop = Column(String)
    location = Column(String)
    min_quantity = Column(Float)


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True)
    buyer_id = Column(Integer)
    pool_id = Column(Integer)
    price = Column(Float)