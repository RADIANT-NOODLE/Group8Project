from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ResidentDirectoryCreate(BaseModel):
    user_id: int
    property_id: int
    occupancy: str = "Occupied"
    status: str = "Active"
    notes: Optional[str] = None

class ResidentDirectoryUpdate(BaseModel):
    occupancy: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class ResidentDirectoryResponse(BaseModel):
    id: int
    user_id: int
    property_id: int
    occupancy: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    
    # These fields will be populated from the relationships
    name: str
    email: str
    role: str
    unit_no: str
    complex_name: str
    street_address: str

    class Config:
        from_attributes = True