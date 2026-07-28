# please check code, was not able to run in  VS on my side - Kai

from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, Text, ForeignKey, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.shared.database import Base

class Review(Base):
    __tablename__ = "reviews"

    review_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=False)

    provider_id = Column(Integer, ForeignKey("service_providers.provider_id", ondelete="CASCADE"), nullable=False)

    rating = Column(Integer, nullable=False)

    comment = Column(Text, nullable=True)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
