from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Inquiry(Base):
    __tablename__ = "inquiries"

    inquiry_id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.unit_id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)  # If buyer is logged in
    
    buyer_name = Column(String(100), nullable=False)
    buyer_email = Column(String(255), nullable=False)
    buyer_contact = Column(String(50), nullable=True)
    
    message = Column(Text, nullable=True)
    status = Column(String(20), default="New")  # New, Contacted, Viewing Scheduled, Closed
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    property = relationship("Property")
    agent = relationship("User", foreign_keys=[agent_id])
    buyer = relationship("User", foreign_keys=[buyer_id])