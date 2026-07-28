# please check code, was not able to run in  VS on my side - Kai

from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy import Numeric

from app.shared.database import Base

class Announcements(Base):
    __tablename__ = "announcements"

    announcement_id = Column(Integer, primary_key=True, index=True)

    title = Column(String(100), nullable=False)

    message = Column(String(500), nullable=False)

    created_by = Column(Integer, nullable=False)

    expires_at = Column(TIMESTAMP(timezone=True), nullable=True)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
