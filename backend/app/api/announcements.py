from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.database import get_db
from app.models import Announcement

router = APIRouter()

class AnnouncementCreate(BaseModel):
    title: str
    message: str
    created_by: int
    expires_at: Optional[date] = None

@router.get("/api/announcements")
def get_all_announcements(db: Session = Depends(get_db)):
    announcements = db.query(Announcement).all()
    return {"count": len(announcements), "announcements": announcements}

@router.get("/api/announcements/{announcement_id}")
def get_announcement(announcement_id: int, db: Session = Depends(get_db)):
    announcement = db.query(Announcement).filter(Announcement.announcement_id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return announcement

@router.post("/api/announcements")
def create_announcement(announcement: AnnouncementCreate, db: Session = Depends(get_db)):
    new_announcement = Announcement(
        title = announcement.title,
        message = announcement.message,
        created_by = announcement.created_by,
        expires_at = announcement.expires_at
    )
    db.add(new_announcement)
    db.commit()
    db.refresh(new_announcement)
    return {"message": "Announcement created successfully", "announcement": new_announcement}
