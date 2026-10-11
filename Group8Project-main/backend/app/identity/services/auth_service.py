"""Authentication application service — orchestrates registration and login use cases."""
from datetime import timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.common.datetime_utils import utcnow
from app.common.enums import APPROVAL_EXEMPT_ROLES, UserRole
from app.common.validators import normalise_email
from app.core.config import get_settings
from app.core.exceptions import ConflictException, CredentialsException, ForbiddenException
from app.core.security import (
    create_access_token,
    generate_session_token,
    hash_password,
    hash_session_token,
    verify_password,
)
from app.identity.models.user import User
from app.identity.repositories.login_attempt_repository import LoginAttemptRepository
from app.identity.repositories.session_repository import SessionRepository
from app.identity.repositories.user_repository import UserRepository
from app.identity.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserResponse


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = UserRepository(db)
        self._sessions = SessionRepository(db)
        self._attempts = LoginAttemptRepository(db)

    async def register(self, payload: RegisterRequest) -> AuthResponse:
        # SECURITY: HOA admin accounts can never be self-registered. They are created by
        # the bootstrap script (python -m app.scripts.create_hoa_admin) or promoted by an
        # existing admin via PATCH /users/{id}.
        if payload.role == UserRole.hoa_admin:
            raise ForbiddenException(
                "HOA administrator accounts cannot be created through public registration."
            )

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
            # visitors need no vetting; every other role goes into the HOA approval queue
            hoa_approved=payload.role.value in APPROVAL_EXEMPT_ROLES,
        )

        return await self._build_auth_response(user)

    async def login(self, payload: LoginRequest, ip_address: str | None = None) -> AuthResponse:
        email = normalise_email(payload.email)
        user = await self._repo.get_by_email(email)

        if user is None or not verify_password(payload.password, user.password_hash):
            await self._attempts.record(email=email, ip_address=ip_address, successful=False)
            raise CredentialsException("Invalid email or password.")

        await self._attempts.record(email=email, ip_address=ip_address, successful=True)
        await self._sessions.purge_expired(user.user_id, utcnow())
        return await self._build_auth_response(user)

    async def get_current_user(self, user_id: int) -> UserResponse:
        user = await self._repo.get_by_id(user_id)
        if user is None:
            raise CredentialsException("User not found.")
        return UserResponse.model_validate(user)

    async def _build_auth_response(self, user: User) -> AuthResponse:
        """Open a session row and issue a JWT bound to it (claim `sid`).

        Binding the token to a session is what makes DELETE /sessions work: once the row is
        gone, the token is rejected even if it has not expired yet.
        """
        lifetime = timedelta(minutes=get_settings().ACCESS_TOKEN_EXPIRE_MINUTES)
        session = await self._sessions.create(
            user_id=user.user_id,
            token_hash=hash_session_token(generate_session_token()),
            expires_at=utcnow() + lifetime,
        )
        token = create_access_token(
            {"sub": str(user.user_id), "role": user.role, "sid": session.session_id},
            expires_delta=lifetime,
        )
        return AuthResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
