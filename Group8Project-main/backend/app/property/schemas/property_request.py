from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

# For creating a new request (from the Resident)
class PropertyRequestCreate(BaseModel):
    unit_id: int
    request_type: str
    asking_price: float
    rental_period: Optional[str] = None
    financial_information: Optional[str] = None
    additional_details: Optional[str] = None

# For returning a request (to the HOA Admin and Agent)
class PropertyRequestResponse(BaseModel):
    request_id: int
    requester_id: int
    unit_id: int
    request_type: str
    asking_price: Decimal
    rental_period: Optional[str] = None
    financial_information: Optional[str] = None
    additional_details: Optional[str] = None
    status: str
    rejection_reason: Optional[str] = None
    assigned_agent_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    # Joined fields (populated manually in the API endpoint)
    requester_name: Optional[str] = None
    unit_no: Optional[str] = None

    class Config:
        from_attributes = True