"""Authentication application service — orchestrates registration and login use cases."""
from urllib.parse import quote

from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import UserRole
from app.common.validators import normalise_email
from app.core.config import get_settings
from app.core.email import send_password_reset_email
from app.core.exceptions import ConflictException, CredentialsException
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    hash_password,
    password_reset_token_matches,
    read_password_reset_token,
    verify_password,
)
from app.identity.models.user import User
from app.identity.repositories.user_repository import UserRepository
from app.identity.schemas.auth import (
    AuthResponse,
    ChangePasswordRequest,
    CreateEstateAgentRequest,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    ResetPasswordRequest,
    UpdateProfileRequest,
    UserResponse,
    UserSummary,
)

# Same answer whether or not the e-mail exists, so the endpoint cannot be used
# to find out who has an account.
_FORGOT_PASSWORD_MESSAGE = (
    "If an account exists for that e-mail address, a password reset link has been sent."
)


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = UserRepository(db)

    async def register(self, payload: RegisterRequest) -> AuthResponse:
        email = normalise_email(payload.email)

        existing = await self._repo.get_by_email(email)
        if existing is not None:
            raise ConflictException("An account with this email already exists.")

        password_hash = hash_password(payload.password)
        user = await self._repo.create(
            full_name=payload.full_name,
            email=email,
            password_hash=password_hash,
            role=payload.role.value,
            phoneno=payload.phoneno,
            unit_no=payload.unit_no,
        )

        return self._build_auth_response(user)

    async def create_estate_agent(self, payload: CreateEstateAgentRequest) -> UserSummary:
        """Create an already-approved estate agent account (HOA administrators only)."""
        email = normalise_email(payload.email)
        if await self._repo.get_by_email(email) is not None:
            raise ConflictException("An account with this email already exists.")

        user = await self._repo.create(
            full_name=payload.full_name,
            email=email,
            password_hash=hash_password(payload.password),
            role=UserRole.estate_agent.value,
            phoneno=payload.phoneno,
            hoa_approved=True,
        )
        return UserSummary.model_validate(user)

    async def login(self, payload: LoginRequest) -> AuthResponse:
        email = normalise_email(payload.email)
        user = await self._repo.get_by_email(email)

        if user is None or not verify_password(payload.password, user.password_hash):
            raise CredentialsException("Invalid email or password.")

        return self._build_auth_response(user)

    async def change_password(self, user: User, payload: ChangePasswordRequest) -> MessageResponse:
        if not verify_password(payload.current_password, user.password_hash):
            raise CredentialsException("Your current password is incorrect.")
        if verify_password(payload.new_password, user.password_hash):
            raise ConflictException("Your new password must be different from your current password.")
        await self._repo.set_password_hash(user, hash_password(payload.new_password))
        return MessageResponse(message="Password updated successfully.")

    async def request_password_reset(self, payload: ForgotPasswordRequest) -> MessageResponse:
        settings = get_settings()
        user = await self._repo.get_by_email(normalise_email(payload.email))
        dev_link: str | None = None

        if user is not None:
            token = create_password_reset_token(user.user_id, user.password_hash)
            link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={quote(token)}"
            await send_password_reset_email(user.email, link)
            if settings.EXPOSE_RESET_LINK and not settings.SMTP_HOST:
                dev_link = link

        return MessageResponse(message=_FORGOT_PASSWORD_MESSAGE, dev_reset_link=dev_link)

    async def reset_password(self, payload: ResetPasswordRequest) -> MessageResponse:
        invalid = CredentialsException("This password reset link is invalid or has expired.")
        try:
            user_id, fingerprint = read_password_reset_token(payload.token)
        except JWTError:
            raise invalid

        user = await self._repo.get_by_id(user_id)
        # the fingerprint no longer matches once the password has changed -> link is single use
        if user is None or not password_reset_token_matches(fingerprint, user.password_hash):
            raise invalid

        await self._repo.set_password_hash(user, hash_password(payload.new_password))
        return MessageResponse(message="Your password has been reset. You can now sign in.")

    async def update_profile(self, user: User, payload: UpdateProfileRequest) -> UserResponse:
        updated = await self._repo.update_profile(
            user, full_name=payload.full_name, phoneno=payload.phoneno
        )
        return UserResponse.model_validate(updated)

    async def get_current_user(self, user_id: int) -> UserResponse:
        user = await self._repo.get_by_id(user_id)
        if user is None:
            raise CredentialsException("User not found.")
        return UserResponse.model_validate(user)

    @staticmethod
    def _build_auth_response(user: User) -> AuthResponse:
        token = create_access_token({"sub": str(user.user_id), "role": user.role})
        return AuthResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
