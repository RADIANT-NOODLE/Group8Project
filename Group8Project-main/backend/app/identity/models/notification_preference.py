"""NotificationPreference model — per-user channel toggles."""
from sqlalchemy import Boolean, Column, ForeignKey, Integer, TIMESTAMP
from sqlalchemy.sql import func

from app.db.base import Base


class NotificationPreference(Base):
    """Stores a user's opt-in/opt-out preferences for each notification channel."""

    __tablename__ = "notification_preferences"

    user_id = Column(
        Integer, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True
    )
    # In-app inbox toggle
    inbox_enabled = Column(Boolean, nullable=False, default=True)
    # Email toggle — requires SMTP config in .env
    email_enabled = Column(Boolean, nullable=False, default=False)

    # Granular category toggles
    complaints = Column(Boolean, nullable=False, default=True)
    work_orders = Column(Boolean, nullable=False, default=True)
    announcements = Column(Boolean, nullable=False, default=True)
    approvals = Column(Boolean, nullable=False, default=True)

    updated_at = Column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )
