# please check code, was not able to run in  VS on my side - Kai

from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy import Numeric

from app.shared.database import Base

class Sales(Base):
    __tablename__ = "sales"

    sale_id = Column(Integer, primary_key=True, index=True)

    unit_id = Column(Integer, nullable=False)

    price = Column(Numeric(12, 2), nullable=False)

    sale_date = Column(TIMESTAMP(timezone=True), nullable=False)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
