# please check code, was not able to run in  VS on my side - Kai

from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy import Numeric

from app.shared.database import Base

class Reviews(Base):
    __tablename__ = "reviews"

    review_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=False)

    provider_id = Column(Integer, nullable=False)

    rating = Column(Integer, nullable=False)

    comment = Column(String(500), nullable=True)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
