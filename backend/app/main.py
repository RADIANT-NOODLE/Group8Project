import logging
from fastapi import FastAPI, Depends, HTTPException  # kai added depends and httpexception
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session # added - kai
from pydantic import BaseModel # added - kai

from app.shared.logging import configure_logging
from app.shared.config import get_settings

# Import database and models
from app.database import engine, Base, get_db # -kai
from app.models import User, Property, Complaint # -kai


# 1. Initialize logging before doing anything else
configure_logging()
logger = logging.getLogger(__name__)

# 2. Get environment settings
settings = get_settings()

# 3. Create database tables - kai added
Base.metadata.create_all(bind=engine)

# 4. create FASTAPI app
app = FastAPI(
    title="VALORA API",
    description="Property Health Intelligence Platform",
    version="1.0.0"
)

# add CORS middelware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace "*" with your specific frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# startup event
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting VALORA API in {settings.ENVIRONMENT} mode.")

# 7. Endpoints - kai
@app.get("/")
def root():
    return {
        "message": "Welcome to VALORA API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}

# API endpoints - kai
@app.get("/api/test/users")
def test_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {"count": len(users), "users": users}

@app.get("/api/complaints")
def get_all_complaints(db: Session = Depends(get_db)):
    """
    Fetch all complaints from the database.
    """
    complaints = db.query(Complaint).all()
    return {
        "count": len(complaints),
        "complaints": complaints
    }

class ComplaintCreate(BaseModel):
    user_id: int
    unit_id: int
    category: str
    description: str

@app.post("/api/complaints")
def create_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db)):
    """
    Create a new complaint in the database.
    """
    new_complaint = Complaint(
        user_id=complaint.user_id,
        unit_id=complaint.unit_id,
        category=complaint.category,
        description=complaint.description
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    return {"message": "Complaint created successfully", "complaint": new_complaint}
