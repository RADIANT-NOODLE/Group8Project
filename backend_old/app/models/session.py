# please check code, was not able to run in  VS on my side - Kai

from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, Text, ForeignKey, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.shared.database import Base

class Session(Base):
    __tablename__ = "sessions"

    session_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)

    refresh_token = Column(String(255), unique=True, nullable=False)

    expires_at = Column(TIMESTAMP(timezone=True), nullable=False)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
