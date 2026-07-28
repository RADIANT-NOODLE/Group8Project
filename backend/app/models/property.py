# please check code, was not able to run in  VS on my side - Kai

from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, Text, ForeignKey, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.shared.database import Base

class Property(Base):
    __tablename__ = "properties"

    unit_id = Column(Integer, primary_key=True, index=True)

    unit_no = Column(String(10), nullable=False, unique=True) # please check this line for anything missing

    complex_name = Column(String(255), nullable=False)

    street_address = Column(String(255), nullable=False)

    suburb = Column(String(255), nullable=True)

    size_m2 = Column(Numeric(8, 2), nullable=True)

    bedrooms = Column(Integer, nullable=True)

    bathrooms = Column(Integer, nullable=True)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(),onupdate=func.now())
