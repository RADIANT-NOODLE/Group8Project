from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, TIMESTAMP, true
from sqlalchemy.sql import func

from app.db.base import Base


class Announcement(Base):
    __tablename__ = "announcements"

    announcement_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, server_default="General")
    # drafts are visible to HOA admins only
    is_published = Column(Boolean, nullable=False, server_default=true())
    created_by = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    expires_at = Column(TIMESTAMP(timezone=True), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
