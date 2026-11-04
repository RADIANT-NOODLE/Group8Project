"""Notification model — in-app notification inbox for Valora users."""
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, TIMESTAMP
from sqlalchemy.sql import func

from app.db.base import Base


class Notification(Base):
    """An in-app notification message delivered to a specific user."""

    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Category: complaint_update | work_order_update | announcement | system | approval
    category = Column(String(40), nullable=False, default="system")
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    # Optional deep-link: entity type and ID so the UI can navigate
    entity_type = Column(String(40), nullable=True)   # e.g. "complaint"
    entity_id = Column(Integer, nullable=True)         # e.g. 42

    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    read_at = Column(TIMESTAMP(timezone=True), nullable=True)
