# please check code - service providers table from DB (Kai)

from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy import Numeric

from app.shared.database import Base

class ServiceProviders(Base):
    __tablename__ = "service_providers"

    provider_id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100, nullable=False))

    trade = Column(String(50), nullable=False)

    phone = Column(String(20), nullable=False)

    email = Column(String(25), nullable=False, unique=True)

    avg_rating = Column(Numeric(3, 2), nullable=True)

    total_reviews = Column(Integer, nullable=True)

    verified = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
