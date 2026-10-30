from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class ResidentDirectory(Base):
    __tablename__ = "resident_directory"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, unique=True)
    property_id = Column(Integer, ForeignKey("properties.unit_id"), nullable=False)
    
    occupancy = Column(String(20), default="Occupied") # "Occupied" or "Vacant"
    status = Column(String(20), default="Active")     # "Active" or "Inactive"
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships to fetch names/addresses automatically
    user = relationship("User")
    property = relationship("Property")