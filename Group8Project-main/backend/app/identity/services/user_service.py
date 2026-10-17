"""User administration service — HOA approval workflows."""
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenException, NotFoundException
from app.identity.models.user import User
from app.identity.repositories.user_repository import UserRepository
from app.identity.schemas.auth import UserSummary


class UserAdminService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = UserRepository(db)

    @staticmethod
    def _require_admin(actor: User) -> None:
        if actor.role not in ("hoa_admin", "head_admin", "admin"):
            raise ForbiddenException("Only HOA admins can perform this action.")

    async def list_pending(self, actor: User) -> list[UserSummary]:
        self._require_admin(actor)
        users = await self._repo.list_pending()
        return [UserSummary.model_validate(u) for u in users]

    async def approve(self, user_id: int, actor: User) -> UserSummary:
        self._require_admin(actor)
        user = await self._repo.get_by_id(user_id)
        if user is None:
            raise NotFoundException(f"User with id {user_id} was not found.")
        user = await self._repo.set_approval(user, True)
        return UserSummary.model_validate(user)

    async def reject(self, user_id: int, actor: User) -> None:
        self._require_admin(actor)
        user = await self._repo.get_by_id(user_id)
        if user is None:
            raise NotFoundException(f"User with id {user_id} was not found.")
        await self._repo.delete(user)
