# please check code - service providers table from DB (Kai)

from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, Text, ForeignKey, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.shared.database import Base

class ServiceProvider(Base):
    __tablename__ = "service_providers"

    provider_id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    trade = Column(String(50), nullable=False)

    phone = Column(String(20), nullable=False)

    email = Column(String(225), nullable=False, unique=True)

    avg_rating = Column(Numeric(3, 2), nullable=True)

    total_reviews = Column(Integer, nullable=True)

    verified = Column(Boolean, default=False)

    emergency_available = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
