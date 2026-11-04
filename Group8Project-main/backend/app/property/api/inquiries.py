import time
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from datetime import datetime

from app.common.enums import ADMIN_ROLES
from app.core.security import decode_access_token
from app.db.session import get_db
from app.identity.api.dependencies import CurrentUser
from app.identity.models.user import User
from app.property.models.inquiry import Inquiry
from app.property.models.listing import Listing
from app.property.models.property_request import PropertyRequest
from app.property.schemas.inquiry import InquiryCreate, InquiryUpdate, InquiryResponse

router = APIRouter(prefix="/inquiries", tags=["Inquiries"])

optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token", auto_error=False)

# Enquiry status that ends a deal -> (listing status, request type, listing type, wording).
DEAL_OUTCOMES = {
    "Sold": ("sold", "sell", "sale", "sold"),
    "Rented Out": ("rented", "rent", "rent", "rented out"),
}

# Anyone can send an enquiry, so each address gets a limited number. Kept in memory:
# it resets on restart and is per process, which is enough to stop casual flooding.
MAX_ENQUIRIES_PER_WINDOW = 5
ENQUIRY_WINDOW_SECONDS = 600
_recent_enquiries: dict[str, list[float]] = {}


def _check_enquiry_limit(address: str) -> None:
    now = time.monotonic()
    for key in [key for key, times in _recent_enquiries.items() if now - times[-1] >= ENQUIRY_WINDOW_SECONDS]:
        del _recent_enquiries[key]

    recent = [sent for sent in _recent_enquiries.get(address, []) if now - sent < ENQUIRY_WINDOW_SECONDS]
    if len(recent) >= MAX_ENQUIRIES_PER_WINDOW:
        raise HTTPException(status_code=429, detail="Too many enquiries. Please try again in a few minutes.")
    _recent_enquiries[address] = [*recent, now]


def _signed_in_user_id(token: str | None) -> int | None:
    """The sender's id if they are signed in. A guest or an expired login still may enquire."""
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        return None if payload.get("purpose") is not None else int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        return None


async def _agent_for_unit(db: AsyncSession, unit_id: int) -> int:
    """The agent assigned to the unit, or else whoever published its live listing."""
    listing = (
        await db.execute(
            select(Listing)
            .where(Listing.unit_id == unit_id, Listing.status == "active")
            .order_by(Listing.updated_at.desc(), Listing.listing_id.desc())
            .limit(1)
        )
    ).scalars().first()
    if listing is None:
        raise HTTPException(status_code=404, detail="This property is not currently listed.")

    assigned_agent_id = (
        await db.execute(
            select(PropertyRequest.assigned_agent_id)
            .where(
                PropertyRequest.unit_id == unit_id,
                PropertyRequest.assigned_agent_id.is_not(None),
                # older requests were saved as 'Assigned'
                func.lower(PropertyRequest.status).in_(("assigned", "listed")),
            )
            .order_by(PropertyRequest.updated_at.desc(), PropertyRequest.request_id.desc())
            .limit(1)
        )
    ).scalars().first()
    return assigned_agent_id or listing.agent_id

async def _record_deal(db: AsyncSession, unit_id: int, outcome: str) -> None:
    """Take the unit off the market and complete its request. The caller commits, so it all saves together."""
    listing_status, request_type, listing_type, wording = DEAL_OUTCOMES[outcome]

    live = (
        await db.execute(
            select(Listing)
            .where(Listing.unit_id == unit_id, Listing.status == "active")
            .order_by(Listing.updated_at.desc(), Listing.listing_id.desc())
        )
    ).scalars().all()
    if not live:
        raise HTTPException(status_code=409, detail="This property is no longer on the market.")
    # older listings have no type, so only a known type can rule an outcome out
    if live[0].listing_type and live[0].listing_type != listing_type:
        raise HTTPException(status_code=409, detail=f"This property is not listed in a way that can be {wording}.")

    # every live listing, in case the unit was published more than once
    for listing in live:
        listing.status = listing_status

    open_requests = (
        await db.execute(
            select(PropertyRequest).where(
                PropertyRequest.unit_id == unit_id,
                PropertyRequest.request_type == request_type,
                func.lower(PropertyRequest.status).in_(("assigned", "listed")),
            )
        )
    ).scalars().all()
    for property_request in open_requests:
        property_request.status = listing_status


async def _listing_types(db: AsyncSession, unit_ids: set[int]) -> dict[int, str]:
    """Each unit's newest known listing type."""
    if not unit_ids:
        return {}
    rows = await db.execute(
        select(Listing.unit_id, Listing.listing_type)
        .where(Listing.unit_id.in_(unit_ids), Listing.listing_type.is_not(None))
        .order_by(Listing.updated_at, Listing.listing_id)
    )
    return {unit_id: listing_type for unit_id, listing_type in rows.all()}


def format_inquiry(inq: Inquiry, listing_type: str | None = None) -> dict:
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
        "agent_name": inq.agent.full_name if inq.agent else None,
        "listing_type": listing_type,
    }

# 1. GET Agent's Inquiries
@router.get("", response_model=List[InquiryResponse])
async def get_my_inquiries(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
):
    """An agent sees the inquiries assigned to them; an administrator sees all of them."""
    stmt = select(Inquiry).options(
        selectinload(Inquiry.property),
        selectinload(Inquiry.agent),
    ).order_by(
        Inquiry.created_at.desc()
    )
    if current_user.role not in ADMIN_ROLES:
        stmt = stmt.where(Inquiry.agent_id == current_user.user_id)

    result = await db.execute(stmt)
    inquiries = result.scalars().all()
    types = await _listing_types(db, {i.property_id for i in inquiries})
    return [format_inquiry(i, types.get(i.property_id)) for i in inquiries]


# 2. CREATE an Inquiry (public: no account needed)
@router.post("", status_code=201)
async def create_inquiry(
    payload: InquiryCreate,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    token: Annotated[str | None, Depends(optional_oauth2_scheme)] = None,
):
    """Send an enquiry to the estate agent responsible for a listed property."""
    _check_enquiry_limit(request.client.host if request.client else "unknown")
    agent_id = await _agent_for_unit(db, payload.property_id)

    new_inquiry = Inquiry(
        property_id=payload.property_id,
        agent_id=agent_id,
        buyer_id=_signed_in_user_id(token),
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
    """Update an inquiry. Marking it Sold or Rented Out also closes the property's listing and request."""
    stmt = select(Inquiry).where(Inquiry.inquiry_id == inquiry_id)
    result = await db.execute(stmt)
    inquiry = result.scalars().first()
    
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
        
    if inquiry.agent_id != current_user.user_id and current_user.role not in ("hoa_admin", "head_admin"):
        raise HTTPException(status_code=403, detail="Not authorized to edit this inquiry")
        
    if inquiry.status == payload.status:
        return {"message": "Inquiry status updated"}
    if inquiry.status in DEAL_OUTCOMES:
        raise HTTPException(status_code=409, detail=f"This inquiry is already marked {inquiry.status} and cannot be changed.")

    if payload.status in DEAL_OUTCOMES:
        await _record_deal(db, inquiry.property_id, payload.status)

    inquiry.status = payload.status
    inquiry.updated_at = datetime.utcnow()
    await db.commit()
    
    return {"message": "Inquiry status updated"}