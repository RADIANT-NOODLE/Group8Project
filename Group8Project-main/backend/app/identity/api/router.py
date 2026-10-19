"""Identity API router — auth + user administration.

Provides:
  POST /api/v1/auth/register     — user registration
  POST /api/v1/auth/login        — user login + JWT issuance
  GET  /api/v1/auth/me           — authenticated user profile
  GET  /api/v1/users/pending     — list users awaiting HOA approval
  POST /api/v1/users/{id}/approve — approve a user
  POST /api/v1/users/{id}/reject  — reject a user
"""
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm

from app.core.exceptions import ForbiddenException, NotFoundException
from app.db.session import get_db
from app.identity.api.dependencies import CurrentUser
from app.identity.models.user import User
from app.identity.repositories.user_repository import UserRepository
from app.identity.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
    UserSummary,
)
from app.identity.services.auth_service import AuthService


# =============================================
# AUTH ROUTER
# =============================================

auth_router = APIRouter(prefix="/auth", tags=["identity"])


@auth_router.post("/register", response_model=AuthResponse, status_code=201)
async def register(
    payload: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    """Register a new user and return a JWT."""
    return await AuthService(db).register(payload)


@auth_router.post("/login", response_model=AuthResponse)
async def login(
    payload: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    """Authenticate with JSON credentials and return a JWT."""
    return await AuthService(db).login(payload)

@auth_router.post("/token", response_model=AuthResponse)
async def login_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    """OAuth2 password flow — used by Swagger UI's Authorize button."""
    payload = LoginRequest(
        email=form_data.username,
        password=form_data.password,
    )
    return await AuthService(db).login(payload)

@auth_router.get("/me", response_model=UserResponse)
async def me(current_user: CurrentUser) -> UserResponse:
    """Return the currently authenticated user's profile."""
    return UserResponse.model_validate(current_user)


# =============================================
# USERS (HOA APPROVAL) ROUTER
# =============================================

users_router = APIRouter(prefix="/users", tags=["users"])


def _require_admin(actor: User) -> None:
    """Only HOA admins can manage approvals."""
    if actor.role not in ("hoa_admin", "head_admin", "admin"):
        raise ForbiddenException("Only HOA admins can perform this action.")


@users_router.get("/pending", response_model=list[UserSummary])
async def list_pending_users(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[UserSummary]:
    """List all users awaiting HOA approval (HOA admin only)."""
    _require_admin(current_user)
    repo = UserRepository(db)
    users = await repo.list_pending()
    return [UserSummary.model_validate(u) for u in users]


@users_router.post("/{user_id}/approve", response_model=UserSummary)
async def approve_user(
    user_id: int,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserSummary:
    """Approve a user so they can log in (HOA admin only)."""
    _require_admin(current_user)
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if user is None:
        raise NotFoundException(f"User with id {user_id} was not found.")
    user = await repo.set_approval(user, True)
    return UserSummary.model_validate(user)


@users_router.post("/{user_id}/reject", status_code=204)
async def reject_user(
    user_id: int,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Reject a user and remove them from the system (HOA admin only)."""
    _require_admin(current_user)
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if user is None:
        raise NotFoundException(f"User with id {user_id} was not found.")
    await repo.delete(user)


# =============================================
# COMBINED ROUTER — exported as `router`
# =============================================

router = APIRouter()
router.include_router(auth_router)
router.include_router(users_router)