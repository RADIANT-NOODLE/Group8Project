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
