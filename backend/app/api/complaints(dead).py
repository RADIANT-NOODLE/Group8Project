from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import Complaint

router = APIRouter()

# define schema for creating a complaint
class ComplaintCreate(BaseModel):
    user_id: int
    unit_id: int
    category: str
    description: str

@router.get("/api/complaints")
def get_all_complaints(db: Session = Depends(get_db)):
    complaints = db.query(Complaint).all()
    return {"count": len(complaints), "complaints": complaints}

@router.post("/api/complaints")
def create_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db)):
    new_complaint = Complaint(
        user_id = complaint.user_id,
        unit_id = complaint.unit_id,
        category = complaint.category,
        description = complaint.description,
        status = "submitted"
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    return {"message": "Complaint created successfully", "complaint": new_complaint}
