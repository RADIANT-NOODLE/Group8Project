from sqlalchemy import Column, ForeignKey, Integer, Numeric, String, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class PropertyRequest(Base):
    """A resident asking to sell or rent a unit.

    Flow: pending_review -> (HOA) approved | rejected -> (HOA) assigned to an estate agent.
    """

    __tablename__ = "property_requests"

    request_id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    unit_id = Column(Integer, ForeignKey("properties.unit_id", ondelete="CASCADE"), nullable=False)
    request_type = Column(String(10), nullable=False)
    asking_price = Column(Numeric(12, 2), nullable=False)
    rental_period = Column(String(30), nullable=True)
    financial_information = Column(Text, nullable=True)
    additional_details = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="pending_review")
    rejection_reason = Column(Text, nullable=True)
    decided_by = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    decided_at = Column(TIMESTAMP(timezone=True), nullable=True)
    assigned_agent_id = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    assigned_at = Column(TIMESTAMP(timezone=True), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    requester = relationship("User", foreign_keys=[requester_id], lazy="joined")
    assigned_agent = relationship("User", foreign_keys=[assigned_agent_id], lazy="joined")
    property = relationship("Property", foreign_keys=[unit_id], lazy="joined")
