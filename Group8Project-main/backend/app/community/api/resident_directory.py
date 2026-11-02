from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.identity.api.dependencies import require_roles
from app.identity.models.user import User
from app.common.enums import UserRole
from app.community.models.resident_directory import ResidentDirectory
from app.property.models.property import Property
from app.community.schemas.resident_directory import (
    ResidentDirectoryCreate,
    ResidentDirectoryUpdate,
    ResidentDirectoryResponse
)

router = APIRouter(prefix="/resident-directory", tags=["Resident Directory"])

AdminOnly = Annotated[User, require_roles(UserRole.hoa_admin.value)]

# Helper to format the response with joined data
def format_record(record: ResidentDirectory) -> dict:
    return {
        "id": record.id,
        "user_id": record.user_id,
        "property_id": record.property_id,
        "occupancy": record.occupancy,
        "status": record.status,
        "notes": record.notes,
        "created_at": record.created_at,
        # access the related user and property objects
       "name": record.user.full_name if record.user else "Unknown",
        "email": record.user.email if record.user else "Unknown",
        "role": record.user.role if record.user else "Unknown",
        "unit_no": record.property.unit_no if record.property else "Unassigned",
        "complex_name": record.property.complex_name if record.property else "Unknown",
        "street_address": record.property.street_address if record.property else "Unknown",
    }

@router.get("", response_model=List[ResidentDirectoryResponse])
async def list_directory_records(
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,
):
    """Fetch all resident directory records with user and property details."""
    stmt = select(ResidentDirectory).options(
        selectinload(ResidentDirectory.user),
        selectinload(ResidentDirectory.property)
    )
    result = await db.execute(stmt)
    records = result.scalars().all()
    return [format_record(r) for r in records]


@router.post("", response_model=ResidentDirectoryResponse, status_code=201)
async def create_directory_record(
    payload: ResidentDirectoryCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,
):
    """Link an approved user to a property."""
    
    # 1. Check if user is already in the directory
    existing_user = await db.execute(select(ResidentDirectory).where(ResidentDirectory.user_id == payload.user_id))
    if existing_user.scalars().first():
        raise HTTPException(status_code=400, detail="This user is already assigned to a property.")

    # 2. Check if property is already assigned
    existing_prop = await db.execute(select(ResidentDirectory).where(ResidentDirectory.property_id == payload.property_id))
    if existing_prop.scalars().first():
        raise HTTPException(status_code=400, detail="This property already has an assigned holder.")

    # 3. Verify the user and property exist
    user_check = await db.execute(select(User).where(User.user_id == payload.user_id))
    target_user = user_check.scalars().first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    # PREVENT ADMINS FROM BEING ADDED
    if target_user.role not in ["resident", "investor"]:
        raise HTTPException(status_code=400, detail="Only residents and investors can be assigned to a property.")
        
    prop_check = await db.execute(select(Property).where(Property.unit_id == payload.property_id))
    if not prop_check.scalars().first():
        raise HTTPException(status_code=404, detail="Property not found.")

    # 4. Create the record
    new_record = ResidentDirectory(
        user_id=payload.user_id,
        property_id=payload.property_id,
        occupancy=payload.occupancy,
        status=payload.status,
        notes=payload.notes
    )
    db.add(new_record)
    await db.commit()
    
    # Re-fetch with relationships loaded
    stmt = select(ResidentDirectory).options(
        selectinload(ResidentDirectory.user),
        selectinload(ResidentDirectory.property)
    ).where(ResidentDirectory.id == new_record.id)
    result = await db.execute(stmt)
    record = result.scalars().first()
    
    return format_record(record)


@router.patch("/{record_id}", response_model=ResidentDirectoryResponse)
async def update_directory_record(
    record_id: int,
    payload: ResidentDirectoryUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,
):
    """Update occupancy, status or notes for an existing record."""
    stmt = select(ResidentDirectory).options(
        selectinload(ResidentDirectory.user),
        selectinload(ResidentDirectory.property)
    ).where(ResidentDirectory.id == record_id)
    
    result = await db.execute(stmt)
    record = result.scalars().first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Directory record not found.")

    changes = payload.model_dump(exclude_unset=True)
    for key, value in changes.items():
        setattr(record, key, value)
        
    await db.commit()
    await db.refresh(record)
    
    return format_record(record)


@router.delete("/{record_id}", status_code=204)
async def delete_directory_record(
    record_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,
):
    """Remove a user from the resident directory."""
    stmt = select(ResidentDirectory).where(ResidentDirectory.id == record_id)
    result = await db.execute(stmt)
    record = result.scalars().first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Directory record not found.")
        
    await db.delete(record)
    await db.commit()

@router.delete("/{record_id}", status_code=204)
async def delete_directory_record(
    record_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,
):
    """Remove a user from the resident directory."""
    stmt = select(ResidentDirectory).where(ResidentDirectory.id == record_id)
    result = await db.execute(stmt)
    record = result.scalars().first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Directory record not found.")
        
    await db.delete(record)
    await db.commit()
