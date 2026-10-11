"""Login-attempt audit view (HOA admin only).

  GET /login_attempts   recent sign-in attempts; failed ones by default
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import UserRole
from app.db.session import get_db
from app.identity.api.dependencies import require_roles
from app.identity.models.user import User
from app.identity.schemas.session import PaginatedLoginAttemptsResponse
from app.identity.services.login_attempt_service import AttemptFilter, LoginAttemptService

router = APIRouter(prefix="/login_attempts", tags=["login attempts"])

AdminOnly = Annotated[User, require_roles(UserRole.hoa_admin.value)]


@router.get("", response_model=PaginatedLoginAttemptsResponse)
async def list_login_attempts(
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: AdminOnly,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    status: Annotated[AttemptFilter, Query(description="failed (default), success or all")] = "failed",
    email: Annotated[str | None, Query(max_length=255)] = None,
    since_hours: Annotated[int | None, Query(ge=1, le=24 * 90, description="Only the last N hours")] = None,
) -> PaginatedLoginAttemptsResponse:
    return await LoginAttemptService(db).list_attempts(
        page=page, page_size=page_size, status=status, email=email, since_hours=since_hours
    )
