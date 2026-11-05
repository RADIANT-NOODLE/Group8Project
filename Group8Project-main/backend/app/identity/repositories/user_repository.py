"""User repository — mediates all persistence access for the identity domain."""
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.identity.models.terms_acceptance import TermsAcceptance
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
        hoa_approved: bool = False,
        accepted_terms_version: str | None = None,
        accepted_from: str | None = None,
    ) -> User:
        user = User(
            full_name=full_name,
            email=email,
            password_hash=password_hash,
            role=role,
            phoneno=phoneno,
            unit_no=unit_no,
            hoa_approved=hoa_approved,
        )
        self._db.add(user)
        if accepted_terms_version is not None:
            # same commit: an account never exists without its record of agreement
            await self._db.flush()
            self._db.add(
                TermsAcceptance(
                    user_id=user.user_id,
                    terms_version=accepted_terms_version,
                    ip_address=accepted_from[:45] if accepted_from else None,
                )
            )
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

    async def update_profile(self, user: User, *, full_name: str, phoneno: str | None) -> User:
        """Change the user's own display name and phone number."""
        user.full_name = full_name
        user.phoneno = phoneno or None
        await self._db.commit()
        await self._db.refresh(user)
        return user

    async def set_password_hash(self, user: User, password_hash: str) -> User:
        """Replace the user's password hash and persist it."""
        user.password_hash = password_hash
        await self._db.commit()
        await self._db.refresh(user)
        return user

    async def agent_workload(self, agent_id: int) -> dict[str, int]:
        """What would be lost or orphaned if this agent's account were deleted."""
        # imported here because the property models are not needed by the rest of this class
        from app.property.models.inquiry import Inquiry
        from app.property.models.listing import Listing
        from app.property.models.property_request import PropertyRequest

        async def count(model, *conditions) -> int:
            return (await self._db.execute(select(func.count()).select_from(model).where(*conditions))).scalar_one()

        return {
            "listing": await count(Listing, Listing.agent_id == agent_id),
            "enquiry": await count(Inquiry, Inquiry.agent_id == agent_id),
            "open request": await count(
                PropertyRequest,
                PropertyRequest.assigned_agent_id == agent_id,
                # older rows spell these with a capital letter
                func.lower(PropertyRequest.status).in_(("pending_review", "approved", "assigned", "listed")),
            ),
        }

    async def delete(self, user: User) -> None:
        """Delete a user from the database."""
        await self._db.delete(user)
        await self._db.commit()

    async def list_all(self) -> list[User]:
        """Return all users in the database, newest first."""
        result = await self._db.execute(
            select(User)
            .order_by(User.created_at.desc())
        )
        return list(result.scalars().all())