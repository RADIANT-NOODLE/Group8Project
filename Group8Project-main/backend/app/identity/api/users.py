from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import UserRole
from app.db.session import get_db
from app.identity.api.dependencies import require_roles
from app.identity.models.user import User
from app.identity.schemas.user import AdminUserResponse, PaginatedUsersResponse, UserUpdate
from app.identity.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])

AdminOnly = Annotated[User, require_roles(UserRole.hoa_admin.value)]


@router.get("", response_model=PaginatedUsersResponse)
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    role: Annotated[UserRole | None, Query()] = None,
    hoa_approved: Annotated[bool | None, Query()] = None,
    search: Annotated[str | None, Query(max_length=100, description="Name or email contains")] = None,
) -> PaginatedUsersResponse:
    return await UserService(db).list_users(
        page=page,
        page_size=page_size,
        role=role.value if role else None,
        hoa_approved=hoa_approved,
        search=search,
    )


@router.get("/pending", response_model=PaginatedUsersResponse)
async def list_pending_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> PaginatedUsersResponse:
    """Registrations awaiting HOA approval, oldest first."""
    return await UserService(db).list_pending(page=page, page_size=page_size)


@router.get("/{user_id}", response_model=AdminUserResponse)
async def get_user(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,
) -> AdminUserResponse:
    return await UserService(db).get_user(user_id)


@router.patch("/{user_id}", response_model=AdminUserResponse)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: AdminOnly,
) -> AdminUserResponse:
    """Change a user's role, approval flag or profile fields."""
    return await UserService(db).update_user(user_id, payload, admin)


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: AdminOnly,
) -> Response:
    await UserService(db).delete_user(user_id, admin)
    return Response(status_code=204)


@router.post("/{user_id}/approve", response_model=AdminUserResponse)
async def approve_user(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,
) -> AdminUserResponse:
    return await UserService(db).approve_user(user_id)


@router.post("/{user_id}/reject", response_model=AdminUserResponse)
async def reject_user(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,
) -> AdminUserResponse:
    """Reject a pending registration. The account is removed; the response echoes it."""
    return await UserService(db).reject_user(user_id)
