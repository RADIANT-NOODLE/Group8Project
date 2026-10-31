from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InquiryCreate(BaseModel):
    property_id: int
    agent_id: int
    buyer_name: str
    buyer_email: str
    buyer_contact: Optional[str] = None
    message: Optional[str] = None

class InquiryUpdate(BaseModel):
    status: str

class InquiryResponse(BaseModel):
    inquiry_id: int
    property_id: int
    agent_id: int
    buyer_name: str
    buyer_email: str
    buyer_contact: Optional[str] = None
    message: Optional[str] = None
    status: str
    created_at: datetime
    
    # Joined fields for display
    property_unit: Optional[str] = None
    property_complex: Optional[str] = None
    
    class Config:
        from_attributes = True