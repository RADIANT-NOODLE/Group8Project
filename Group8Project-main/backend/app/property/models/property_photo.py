from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.db.base import Base


class PropertyPhoto(Base):
    """One uploaded photo of a property. The file lives on disk; only its name is stored."""

    __tablename__ = "property_photos"

    photo_id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(
        Integer, ForeignKey("properties.unit_id", ondelete="CASCADE"), nullable=False, index=True
    )
    file_name = Column(String(255), nullable=False, unique=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
