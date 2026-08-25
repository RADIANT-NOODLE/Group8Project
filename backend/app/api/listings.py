from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import Listing

router = APIRouter()

class ListingCreate(BaseModel):
    unit_id: int
    agent_id: int
    price: float
    description: Optional[str] = None
    photo_urls: Optional[str] = None

@router.get("/api/listings")
def get_all_listings(db: Session = Depends(get_db)):
    listings = db.query(Listing).all()
    return {"count": len(listings), "listings": listings}

@router.get("/api/listings/{listing_id}")
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.listing_id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.post("/api/listings")
def create_listing(listing: ListingCreate, db: Session = Depends(get_db)):
    new_listing = Listing(
        unit_id = listing.unit_id,
        agent_id = listing.agent_id,
        price = listing.price,
        description = listing.description,
        photo_urls = listing.photo_urls,
        status="active"
    )
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    return {"message": "Listing created successfully", "listing": new_listing}

