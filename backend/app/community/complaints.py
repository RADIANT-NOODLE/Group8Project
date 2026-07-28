# please check code, was not able to run in  VS on my side - Kai

from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy import Numeric

from app.shared.database import Base

class Complaints(Base):
    __tablename__ = "complaints"

    complaint_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=False)

    unit_id = Column(Integer, nullable=False)

    category = Column(String(50), nullable=False)

    description = Column(String(500), nullable=False)

    is_anonymous = Column(Boolean, default=False)

    status = Column(String(20), default="Pending")

    assigned_to = Column(String(100), nullable=True)

    resolved_at = Column(TIMESTAMP(timezone=True), nullable=True)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
