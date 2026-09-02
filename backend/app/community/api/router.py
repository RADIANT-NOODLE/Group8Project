from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date
# from app.database import get_db
# from app.models import Announcement


router = APIRouter(prefix="/community", tags=["community"])


@router.get("/status")
async def community_status():
    return {
        "module": "community",
        "status": "scaffolded",
        "next": "Build complaint lifecycle, work orders, and HOA announcements.",
    }

# kai code
# HOA ANNOUNCEMENTS
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

# WORK ORDERS

class WorkOrderCreate(BaseModel):
    complaint_id: int
    provider_id: Optional[int] = None
    job_cost: Optional[float] = None
    status: Optional[str] = "assigned"
    estimated_completion_date: Optional[date] = None

@router.get("/api/work_orders")
def get_all_work_orders(db: Session = Depends(get_db)):
    work_orders = db.query(MaintenanceworkOrder).all()
    return {"count": len(work_orders), "work_orders": work_orders}

@router.get("/api/work_orders/{work_order_id}")
def get_work_order(work_order_id: int, db: Session = Depends(get_db)):
    work_order = db.query(MaintenanceworkOrder).filter(MaintenanceworkOrder.work_order_id == work_order_id).first()
    if not work_order:
        raise HTTPException(status_code=404, detail="Work Order not found")
    return work_order

@router.post("/api/work_orders")
def create_work_order(work_order: WorkOrderCreate, db: Session = Depends(get_db)):
    new_work_order = MaintenanceworkOrder(
        complaint_id = work_order.complaint_id,
        provider_id = work_order.provider_id,
        job_cost = work_order.job_cost,
        status = work_order.status,
        estimated_completion_data = work_order.estimated_completion_date
    )
    db.add(new_work_order)
    db.commit()
    db.refresh(new_work_order)
    return {"message": "Maintenance Work Order created successfully", "work_order": new_work_order}
