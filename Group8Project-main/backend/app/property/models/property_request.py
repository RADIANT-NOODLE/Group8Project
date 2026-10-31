from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class PropertyRequest(Base):
    __tablename__ = "property_requests"

    request_id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    unit_id = Column(Integer, ForeignKey("properties.unit_id"), nullable=False)
    
    request_type = Column(String(20), nullable=False)
    asking_price = Column(Numeric, nullable=False)
    rental_period = Column(String(50), nullable=True)
    financial_information = Column(Text, nullable=True)
    additional_details = Column(Text, nullable=True)
    
    status = Column(String(20), default="Pending")
    rejection_reason = Column(Text, nullable=True)
    decided_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    decided_at = Column(DateTime, nullable=True)
    
    assigned_agent_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    assigned_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    requester = relationship("User", foreign_keys=[requester_id])
    property = relationship("Property", foreign_keys=[unit_id])