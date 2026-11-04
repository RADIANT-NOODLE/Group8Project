from sqlalchemy import Boolean, Column, ForeignKey, Integer, LargeBinary, String, Text, TIMESTAMP
from sqlalchemy.sql import func

from app.db.base import Base


class Complaint(Base):
    __tablename__ = "complaints"

    complaint_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    unit_id = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    is_anonymous = Column(Boolean, default=False)
    status = Column(String(20), default="submitted")
    photo_url = Column(String(500), nullable=True)
    assigned_to = Column(String(100), nullable=True)
    denial_reason = Column(Text, nullable=True)
    resolved_at = Column(TIMESTAMP(timezone=True), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class ComplaintPhoto(Base):
    """The photo attached to a complaint. Kept in its own table so that loading
    complaints never downloads images."""

    __tablename__ = "complaint_photos"

    complaint_id = Column(
        Integer, ForeignKey("complaints.complaint_id", ondelete="CASCADE"), primary_key=True
    )
    content_type = Column(String(50), nullable=False)
    data = Column(LargeBinary, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
