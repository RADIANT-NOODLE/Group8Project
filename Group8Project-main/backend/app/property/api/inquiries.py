from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from datetime import datetime

from app.db.session import get_db
from app.identity.api.dependencies import CurrentUser
from app.identity.models.user import User
from app.property.models.inquiry import Inquiry
from app.property.schemas.inquiry import InquiryCreate, InquiryUpdate, InquiryResponse

router = APIRouter(prefix="/inquiries", tags=["Inquiries"])

def format_inquiry(inq: Inquiry) -> dict:
    return {
        "inquiry_id": inq.inquiry_id,
        "property_id": inq.property_id,
        "agent_id": inq.agent_id,
        "buyer_name": inq.buyer_name,
        "buyer_email": inq.buyer_email,
        "buyer_contact": inq.buyer_contact,
        "message": inq.message,
        "status": inq.status,
        "created_at": inq.created_at,
        "property_unit": inq.property.unit_no if inq.property else "Unknown",
        "property_complex": inq.property.complex_name if inq.property else "Unknown",
    }

# 1. GET Agent's Inquiries
@router.get("", response_model=List[InquiryResponse])
async def get_my_inquiries(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
):
    """Fetch inquiries assigned to the logged-in agent."""
    stmt = select(Inquiry).options(
        selectinload(Inquiry.property)
    ).where(
        Inquiry.agent_id == current_user.user_id
    ).order_by(
        Inquiry.created_at.desc()
    )
    
    result = await db.execute(stmt)
    inquiries = result.scalars().all()
    return [format_inquiry(i) for i in inquiries]


# 2. CREATE an Inquiry (For Buyers/Investors)
@router.post("", status_code=201)
async def create_inquiry(
    payload: InquiryCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
):
    """Submit a new inquiry to an agent."""
    new_inquiry = Inquiry(
        property_id=payload.property_id,
        agent_id=payload.agent_id,
        buyer_id=current_user.user_id,
        buyer_name=payload.buyer_name,
        buyer_email=payload.buyer_email,
        buyer_contact=payload.buyer_contact,
        message=payload.message,
        status="New",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_inquiry)
    await db.commit()
    await db.refresh(new_inquiry)
    return {"message": "Inquiry submitted", "inquiry_id": new_inquiry.inquiry_id}


# 3. UPDATE Inquiry Status
@router.patch("/{inquiry_id}")
async def update_inquiry_status(
    inquiry_id: int,
    payload: InquiryUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
):
    """Update the status of an inquiry (Agent only)."""
    stmt = select(Inquiry).where(Inquiry.inquiry_id == inquiry_id)
    result = await db.execute(stmt)
    inquiry = result.scalars().first()
    
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
        
    if inquiry.agent_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this inquiry")
        
    inquiry.status = payload.status
    inquiry.updated_at = datetime.utcnow()
    await db.commit()
    
    return {"message": "Inquiry status updated"}