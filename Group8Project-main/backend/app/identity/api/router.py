"""Identity API router — auth + user administration.

Provides:
  POST /api/v1/auth/register     — user registration
  POST /api/v1/auth/login        — user login + JWT issuance
  GET  /api/v1/auth/me           — authenticated user profile
  POST /api/v1/auth/change-password — change own password
  POST /api/v1/auth/forgot-password — request a reset link
  POST /api/v1/auth/reset-password  — set a new password from a reset link
  POST /api/v1/users/estate-agents — HOA admin creates an estate agent account
  GET  /api/v1/users/pending     — list users awaiting HOA approval
  POST /api/v1/users/{id}/approve — approve a user
  POST /api/v1/users/{id}/reject  — reject a user
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm

from app.core.exceptions import ConflictException, ForbiddenException, NotFoundException
from app.core.client_address import client_address
from app.db.session import get_db
from app.identity.api.dependencies import CurrentUser
from app.identity.models.user import User
from app.identity.repositories.user_repository import UserRepository
from app.identity.schemas.auth import (
    AuthResponse,
    ChangePasswordRequest,
    CreateEstateAgentRequest,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    ResetPasswordRequest,
    RegisterRequest,
    UserResponse,
    UpdateProfileRequest,
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
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    """Register a new user and return a JWT."""
    return await AuthService(db).register(payload, client_address(request))


@auth_router.post("/login", response_model=AuthResponse)
async def login(
    payload: LoginRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    """Authenticate with JSON credentials and return a JWT."""
    return await AuthService(db).login(payload, client_address(request))

@auth_router.post("/token", response_model=AuthResponse)
async def login_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    """OAuth2 password flow — used by Swagger UI's Authorize button."""
    payload = LoginRequest(
        email=form_data.username,
        password=form_data.password,
    )
    return await AuthService(db).login(payload, client_address(request))

@auth_router.get("/me", response_model=UserResponse)
async def me(current_user: CurrentUser) -> UserResponse:
    """Return the currently authenticated user's profile."""
    return UserResponse.model_validate(current_user)


@auth_router.patch("/me", response_model=UserResponse)
async def update_me(
    payload: UpdateProfileRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """Update your own name and phone number."""
    return await AuthService(db).update_profile(current_user, payload)


@auth_router.post("/change-password", response_model=MessageResponse)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MessageResponse:
    """Change the signed-in user's password (needs the current password)."""
    return await AuthService(db).change_password(current_user, payload)


@auth_router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MessageResponse:
    """Send a password reset link. Always answers the same way."""
    return await AuthService(db).request_password_reset(payload)


@auth_router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    payload: ResetPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MessageResponse:
    """Set a new password using the token from the reset link."""
    return await AuthService(db).reset_password(payload)


# =============================================
# USERS (HOA APPROVAL) ROUTER
# =============================================

users_router = APIRouter(prefix="/users", tags=["users"])


def _require_admin(actor: User) -> None:
    """Only HOA admins can manage approvals."""
    if actor.role not in ("hoa_admin", "head_admin", "admin"):
        raise ForbiddenException("Only HOA admins can perform this action.")


def _protect_admin_accounts(actor: User, target: User) -> None:
    """Nobody can lock out or delete themselves, and head admins can only be changed by themselves."""
    if target.user_id == actor.user_id:
        raise ForbiddenException("You cannot change your own account here.")
    if target.role == "head_admin":
        raise ForbiddenException("A head admin account cannot be changed here.")


@users_router.post("/estate-agents", response_model=UserSummary, status_code=201)
async def create_estate_agent(
    payload: CreateEstateAgentRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserSummary:
    """Create an estate agent account. The agent is approved immediately (HOA admin only)."""
    _require_admin(current_user)
    return await AuthService(db).create_estate_agent(payload)


@users_router.delete("/estate-agents/{user_id}", status_code=204)
async def delete_estate_agent(
    user_id: int,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete an estate agent (HOA admin only).

    The database removes an agent's listings and enquiries along with the account,
    so an agent who still has any must be refused rather than silently wiped.
    """
    _require_admin(current_user)
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if user is None or user.role != "estate_agent":
        raise NotFoundException(f"Estate agent with id {user_id} was not found.")

    workload = await repo.agent_workload(user_id)
    plural = {"listing": "listings", "enquiry": "enquiries", "open request": "open requests"}
    held = [f"{count} {word if count == 1 else plural[word]}" for word, count in workload.items() if count]
    if held:
        raise ConflictException(
            f"{user.full_name} cannot be deleted because they still have {', '.join(held)}."
        )

    await repo.delete(user)


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

@users_router.get("", response_model=list[UserSummary])
async def get_all_users(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[UserSummary]:
    """List all users in the system (HOA admin only)."""
    _require_admin(current_user)
    repo = UserRepository(db)
    # You will need to add a `list_all` method to your UserRepository
    users = await repo.list_all()
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


@users_router.post("/{user_id}/revoke", response_model=UserSummary)
async def revoke_user(
    user_id: int,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserSummary:
    """Take approval away from a user so they are back to pending (HOA admin only)."""
    _require_admin(current_user)
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if user is None:
        raise NotFoundException(f"User with id {user_id} was not found.")
    _protect_admin_accounts(current_user, user)
    user = await repo.set_approval(user, False)
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
    _protect_admin_accounts(current_user, user)
    await repo.delete(user)


# =============================================
# COMBINED ROUTER — exported as `router`
# =============================================

from app.identity.api.notifications import router as notifications_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(users_router)
router.include_router(notifications_router)
