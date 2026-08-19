# please check code, was not able to run in  VS on my side - Kai

from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, Text, ForeignKey, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.shared.database import Base

class Listing(Base):
    __tablename__ = "listings"

    listing_id = Column(Integer, primary_key=True, index=True)

    unit_id = Column(Integer, nullable=False)

    agent_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)

    price = Column(Numeric(12, 2), nullable=False)

    description = Column(Text, nullable=True)

    photo_url = Column(Text, nullable=True)

    status = Column(String(20), default="active")

    views = Column(Integer, default=0)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
