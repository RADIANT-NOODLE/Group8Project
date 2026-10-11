from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import APPROVAL_EXEMPT_ROLES, UserRole
from app.common.validators import normalise_email
from app.core.exceptions import ConflictException, ForbiddenException, NotFoundException
from app.identity.models.user import User
from app.identity.repositories.user_repository import UserRepository
from app.identity.schemas.user import AdminUserResponse, PaginatedUsersResponse, UserUpdate

_ADMIN = UserRole.hoa_admin.value


class UserService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = UserRepository(db)

    # ---- helpers -------------------------------------------------------

    async def _get_or_404(self, user_id: int) -> User:
        user = await self._repo.get_by_id(user_id)
        if user is None:
            raise NotFoundException(f"User with id {user_id} was not found.")
        return user

    async def _ensure_not_last_admin(self, user: User) -> None:
        if user.role == _ADMIN and await self._repo.count(role=_ADMIN) <= 1:
            raise ConflictException("This is the only HOA administrator; it cannot be removed.")

    # ---- queries -------------------------------------------------------

    async def list_users(
        self,
        *,
        page: int,
        page_size: int,
        role: str | None = None,
        hoa_approved: bool | None = None,
        search: str | None = None,
    ) -> PaginatedUsersResponse:
        filters = dict(role=role, hoa_approved=hoa_approved, search=search)
        users = await self._repo.search(offset=(page - 1) * page_size, limit=page_size, **filters)
        total = await self._repo.count(**filters)
        return PaginatedUsersResponse(
            count=total,
            page=page,
            page_size=page_size,
            users=[AdminUserResponse.model_validate(u) for u in users],
        )

    async def get_user(self, user_id: int) -> AdminUserResponse:
        return AdminUserResponse.model_validate(await self._get_or_404(user_id))

    async def list_pending(self, *, page: int, page_size: int) -> PaginatedUsersResponse:
        users, total = await self._repo.list_pending(
            offset=(page - 1) * page_size,
            limit=page_size,
            exempt_roles=APPROVAL_EXEMPT_ROLES,
        )
        return PaginatedUsersResponse(
            count=total,
            page=page,
            page_size=page_size,
            users=[AdminUserResponse.model_validate(u) for u in users],
        )

    # ---- commands ------------------------------------------------------

    async def update_user(self, user_id: int, payload: UserUpdate, actor: User) -> AdminUserResponse:
        user = await self._get_or_404(user_id)
        changes = payload.model_dump(exclude_unset=True)

        # these columns are NOT NULL (or boolean flags), so an explicit null means "no change"
        for field in ("full_name", "email", "role", "hoa_approved", "email_verified"):
            if field in changes and changes[field] is None:
                del changes[field]

        if "role" in changes:
            changes["role"] = changes["role"].value

        is_self = actor.user_id == user.user_id
        if is_self and (
            ("role" in changes and changes["role"] != user.role)
            or changes.get("hoa_approved") is False
        ):
            raise ForbiddenException("You cannot change your own role or approval status.")

        if "role" in changes and changes["role"] != _ADMIN:
            await self._ensure_not_last_admin(user)

        if "email" in changes:
            email = normalise_email(changes["email"])
            clash = await self._repo.get_by_email(email)
            if clash is not None and clash.user_id != user.user_id:
                raise ConflictException("An account with this email already exists.")
            changes["email"] = email

        for field, value in changes.items():
            setattr(user, field, value)
        user = await self._repo.save(user)
        return AdminUserResponse.model_validate(user)

    async def delete_user(self, user_id: int, actor: User) -> None:
        user = await self._get_or_404(user_id)
        if actor.user_id == user.user_id:
            raise ForbiddenException("You cannot delete your own account.")
        await self._ensure_not_last_admin(user)
        await self._repo.delete(user)

    async def approve_user(self, user_id: int) -> AdminUserResponse:
        user = await self._get_or_404(user_id)
        if not user.hoa_approved:
            user.hoa_approved = True
            user = await self._repo.save(user)
        return AdminUserResponse.model_validate(user)

    async def reject_user(self, user_id: int) -> AdminUserResponse:
        user = await self._get_or_404(user_id)
        if user.hoa_approved:
            raise ConflictException(
                "This registration was already approved. Use DELETE /users/{id} to remove the account."
            )
        snapshot = AdminUserResponse.model_validate(user)
        await self._repo.delete(user)
        return snapshot
