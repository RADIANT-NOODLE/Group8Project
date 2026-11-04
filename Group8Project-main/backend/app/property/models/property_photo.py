from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, LargeBinary, String
from sqlalchemy.orm import deferred
from sqlalchemy.sql import func

from app.db.base import Base


class PropertyPhoto(Base):
    """One uploaded photo of a property.

    The image itself is stored in `data`, so every computer using the shared
    database can show it. `file_name` stays the photo's public name
    (/uploads/properties/<file_name>).
    """

    __tablename__ = "property_photos"

    photo_id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(
        Integer, ForeignKey("properties.unit_id", ondelete="CASCADE"), nullable=False, index=True
    )
    file_name = Column(String(255), nullable=False, unique=True)
    # Deferred: listing a property's photos must not download every image
    # (and keeps property pages working on a database not yet upgraded).
    # Only the photo-file route loads them.
    content_type = deferred(Column(String(50), nullable=True), group="file")
    data = deferred(Column(LargeBinary, nullable=True), group="file")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
