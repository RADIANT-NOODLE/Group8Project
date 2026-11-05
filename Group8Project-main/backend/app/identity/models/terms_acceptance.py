from sqlalchemy import Column, ForeignKey, Integer, String, TIMESTAMP
from sqlalchemy.sql import func

from app.db.base import Base

# Change this whenever the wording in FrontEnd/app/pages/Auth/TermsContent.jsx changes,
# so that each record shows which version the person agreed to.
CURRENT_TERMS_VERSION = "1.0"


class TermsAcceptance(Base):
    """Proof that someone agreed to the terms: who, which version, when and from where.

    Each agreement is its own row, so a later version does not erase an earlier one.
    """

    __tablename__ = "terms_acceptances"

    acceptance_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    terms_version = Column(String(20), nullable=False)
    accepted_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    ip_address = Column(String(45), nullable=True)
