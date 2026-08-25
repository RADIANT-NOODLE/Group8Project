from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import ServiceProvider

router = APIRouter()

# define the schema for creating a service provider
class ServiceProviderCreate(BaseModel):
    full_name: str
    trade: str
    phone: str
    email: Optional[str] = None
    avg_rating: Optional[float] = None
    total_reviews: Optional[int] = None
    verified: Optional[bool] = None
    emergency_available: Optional[bool] = None

@router.get("/api/providers")
def get_all_providers(db: Session = Depends(get_db)):
    providers = db.query(ServiceProvider).all()
    return {"count": len(providers), "providers": providers}

@router.get("/api/providers/{provider_id}")
def get_provider(provider_id: int, db: Session = Depends(get_db)):
    provider = db.query(ServiceProvider).filter(ServiceProvider.provider_id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Service Provider not found")
    return provider

@router.post("/api/providers")
def create_provider(provider: ServiceProviderCreate, db: Session = Depends(get_db)):
    new_provider = ServiceProvider(
        full_name = provider.full_name,
        trade = provider.trade,
        phone = provider.phone,
        email = provider.email,
        avg_rating = provider.avg_rating,
        total_reviews = provider.total_reviews,
        verified = provider.verified,
        emergency_available = provider.emergency_available
    )
    db.add(new_provider)
    db.commit()
    db.refresh(new_provider)
    return {"message": "Service Provider created successfully", "provider": new_provider}
