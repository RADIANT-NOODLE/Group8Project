# please check code, was not able to run in  VS on my side - Kai

from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy import Numeric

from app.shared.database import Base

class Listings(Base):
    __tablename__ = "listings"

    listing_id = Column(Integer, primary_key=True, index=True)

    unit_id = Column(Integer, nullable=False)

    agent_id = Column(Integer, nullable=False)

    price = Column(Numeric(12, 2), nullable=False)

    description = Column(String(500), nullable=True)

    photo_url = Column(String(255), nullable=True)

    status = Column(String(20), default="Active")

    views = Column(Integer, default=0)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
  

    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
