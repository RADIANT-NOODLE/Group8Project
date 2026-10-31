from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.db.session import get_db
from app.identity.api.dependencies import CurrentUser, require_roles
from app.identity.models.user import User
from app.property.models.property_request import PropertyRequest
from app.property.schemas.property_request import PropertyRequestResponse # <--- IMPORT SCHEMA
from app.common.enums import UserRole

router = APIRouter(prefix="/property-requests", tags=["Property Requests"])

class PropertyRequestCreate(BaseModel):
    unit_id: int          
    request_type: str
    asking_price: float
    rental_period: str | None = None
    financial_information: str | None = None
    additional_details: str | None = None

@router.post("", status_code=201)
async def create_property_request(
    payload: PropertyRequestCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
):
    new_request = PropertyRequest(
        requester_id=current_user.user_id,  
        unit_id=payload.unit_id,             
        request_type=payload.request_type,
        asking_price=payload.asking_price,
        rental_period=payload.rental_period,
        financial_information=payload.financial_information,
        additional_details=payload.additional_details,
        status="Pending",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)
    
    return {
        "message": "Request submitted successfully", 
        "request_id": new_request.request_id
    }

AdminOnly = Annotated[User, require_roles(UserRole.hoa_admin.value)]

# GET ALL REQUESTS (For the HOA Admin dashboard)
@router.get("", response_model=List[PropertyRequestResponse]) # <--- ADD response_model
async def list_property_requests(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
):

    # build query base
    stmt = select(PropertyRequest).options(selectinload(PropertyRequest.requester),
                                           selectinload(PropertyRequest.property))
    # SECURITY CHECK: If the user is an Estate Agent, only show their assigned requests
    if current_user.role == "estate_agent":
        stmt = stmt.where(PropertyRequest.assigned_agent_id == current_user.user_id)
    # If the user is not an admin AND not an agent, deny access
    elif current_user.role not in ["hoa_admin", "head_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to view property requests.")

    stmt = stmt.order_by(PropertyRequest.created_at.desc())

    result = await db.execute(stmt)
    requests = result.scalars().all()
    
    # Format the response to include the names the frontend needs
    formatted = []
    for req in requests:
        formatted.append({
            "request_id": req.request_id,
            "requester_id": req.requester_id,
            "requester_name": req.requester.full_name if req.requester else "Unknown",
            "requester_role": req.requester.role if req.requester else "Unknown",
            "unit_id": req.unit_id,
            "unit_no": req.property.unit_no if req.property else "Unknown",
            "request_type": req.request_type,
            "asking_price": req.asking_price,
            "rental_period": req.rental_period,
            "financial_information": req.financial_information,
            "additional_details": req.additional_details,
            "status": req.status,
            "rejection_reason": req.rejection_reason,
            "assigned_agent_id": req.assigned_agent_id,
            "created_at": req.created_at,
            "updated_at": req.updated_at
        })
    return formatted


# APPROVE A REQUEST
@router.patch("/{request_id}/approve")
async def approve_request(
    request_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,
):
    stmt = select(PropertyRequest).where(PropertyRequest.request_id == request_id)
    result = await db.execute(stmt)
    req = result.scalars().first()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    req.status = "Approved"
    await db.commit()
    return {"message": "Request approved"}


# REJECT A REQUEST
@router.patch("/{request_id}/reject")
async def reject_request(
    request_id: int,
    payload: dict,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,
):
    stmt = select(PropertyRequest).where(PropertyRequest.request_id == request_id)
    result = await db.execute(stmt)
    req = result.scalars().first()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    req.status = "Rejected"
    req.rejection_reason = payload.get("reason", "No reason provided")
    await db.commit()
    return {"message": "Request rejected"}


# ASSIGN AN AGENT
@router.patch("/{request_id}/assign")
async def assign_agent(
    request_id: int,
    payload: dict,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,
):
    stmt = select(PropertyRequest).where(PropertyRequest.request_id == request_id)
    result = await db.execute(stmt)
    req = result.scalars().first()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    req.assigned_agent_id = payload.get("agent_id")
    req.status = "Assigned"
    await db.commit()
    return {"message": "Agent assigned"}