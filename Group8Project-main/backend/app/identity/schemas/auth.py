"""Identity Pydantic schemas — request and response models."""
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.common.enums import UserRole
from app.common.validators import (
    reject_control_characters,
    validate_password_strength,
    validate_phone,
)


# --- Auth schemas ---

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: UserRole = UserRole.resident
    phoneno: str | None = Field(default=None, max_length=20)
    unit_no: str | None = Field(default=None, max_length=10)

    @field_validator("password")
    @classmethod
    def _strong_password(cls, value: str) -> str:
        return validate_password_strength(value)

    @field_validator("full_name", "phoneno", "unit_no")
    @classmethod
    def _clean_text(cls, value: str | None) -> str | None:
        return reject_control_characters(value)

    @field_validator("phoneno")
    @classmethod
    def _valid_phone(cls, value: str | None) -> str | None:
        return validate_phone(value)

    @field_validator("role")
    @classmethod
    def _self_service_role_only(cls, value: UserRole) -> UserRole:
        # Privileged accounts are issued by an administrator, never self-registered.
        if value in (UserRole.estate_agent, UserRole.hoa_admin, UserRole.head_admin):
            raise ValueError(
                "This account type cannot be created by self-registration. "
                "Ask a VALORA administrator to create it for you."
            )
        return value


class CreateEstateAgentRequest(BaseModel):
    """An HOA administrator creating an estate agent's account."""

    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    # temporary password: the agent changes it after first sign-in
    password: str = Field(..., min_length=8, max_length=128)
    phoneno: str | None = Field(default=None, max_length=20)

    @field_validator("password")
    @classmethod
    def _strong_password(cls, value: str) -> str:
        return validate_password_strength(value)

    @field_validator("full_name", "phoneno")
    @classmethod
    def _clean_text(cls, value: str | None) -> str | None:
        return reject_control_characters(value)


class LoginRequest(BaseModel):
    email: EmailStr
    # no strength rules here: existing accounts may predate the password policy
    password: str = Field(..., min_length=1, max_length=128)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def _strong_password(cls, value: str) -> str:
        return validate_password_strength(value)


class UpdateProfileRequest(BaseModel):
    """Fields a signed-in user may change on their own profile (not email or role)."""

    full_name: str = Field(..., min_length=2, max_length=100)
    phoneno: str | None = Field(default=None, max_length=20)

    @field_validator("full_name", "phoneno")
    @classmethod
    def _clean_text(cls, value: str | None) -> str | None:
        value = reject_control_characters(value)
        return value.strip() if isinstance(value, str) else value

    @field_validator("phoneno")
    @classmethod
    def _valid_phone(cls, value: str | None) -> str | None:
        return validate_phone(value)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=10, max_length=2000)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def _strong_password(cls, value: str) -> str:
        return validate_password_strength(value)


class MessageResponse(BaseModel):
    message: str
    # only present when EXPOSE_RESET_LINK is on (local development)
    dev_reset_link: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- User schemas ---

class UserResponse(BaseModel):
    user_id: int = Field(..., serialization_alias="id")
    email: str
    full_name: str
    role: str
    unit_no: str | None
    phoneno: str | None = None
    email_verified: bool
    hoa_approved: bool

    model_config = {"from_attributes": True, "populate_by_name": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserSummary(BaseModel):
    user_id: int = Field(..., serialization_alias="id")
    email: str
    full_name: str
    role: str
    unit_no: str | None
    phoneno: str | None = None
    email_verified: bool
    hoa_approved: bool

    model_config = {"from_attributes": True, "populate_by_name": True}
