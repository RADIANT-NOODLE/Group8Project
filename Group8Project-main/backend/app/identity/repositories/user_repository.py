"""User repository — mediates all persistence access for the identity domain."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.identity.models.user import User


class UserRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_email(self, email: str) -> User | None:
        result = await self._db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: int) -> User | None:
        result = await self._db.execute(select(User).where(User.user_id == user_id))
        return result.scalar_one_or_none()

    async def create(
        self,
        *,
        full_name: str,
        email: str,
        password_hash: str,
        role: str,
        phoneno: str | None = None,
        unit_no: str | None = None,
    ) -> User:
        user = User(
            full_name=full_name,
            email=email,
            password_hash=password_hash,
            role=role,
            phoneno=phoneno,
            unit_no=unit_no,
        )
        self._db.add(user)
        await self._db.commit()
        await self._db.refresh(user)
        return user

    async def list_pending(self) -> list[User]:
        """Return all users awaiting HOA approval, oldest first."""
        result = await self._db.execute(
            select(User)
            .where(User.hoa_approved == False)  
            .order_by(User.created_at.asc())
        )
        return list(result.scalars().all())

    async def set_approval(self, user: User, approved: bool) -> User:
        """Set the hoa_approved flag and persist it."""
        user.hoa_approved = approved
        await self._db.commit()
        await self._db.refresh(user)
        return user

    async def delete(self, user: User) -> None:
        """Delete a user from the database."""
        await self._db.delete(user)
        await self._db.commit()