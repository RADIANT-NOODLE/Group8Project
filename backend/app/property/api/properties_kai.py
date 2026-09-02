from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import Property

router = APIRouter()

# define the schema for creating property
class PropertyCreate(BaseModel):
    unit_no: str
    complex_name: Optional[str] = None
    street_address: str
    suburb: Optional[str] = None
    size_m2: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None

@router.get("/api/properties")
def get_all_properties(db: Session = Depends(get_db)):
    properties = db.query(Property).all()
    return {"count": len(properties), "properties": properties}


@router.get("/api/properties/{unit_id}")
def get_property(unit_id: int, db: Session = Depends(get_db)):
    """Fetch a specific property by ID."""
    property = db.query(Property).filter(Property.unit_id == unit_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property


@router.post("/api/properties")
def create_properties(property: PropertyCreate, db: Session = Depends(get_db)):
    new_property = Property(
        unit_no = property.unit_no,
        complex_name = property.complex_name,
        street_address = property.street_address,
        suburb = property.suburb,
        size_m2 = property.size_m2,
        bedrooms = property.bedrooms,
        bathrooms = property.bathrooms
    )
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    return {"message": "Property created successfully", "property": new_property}
