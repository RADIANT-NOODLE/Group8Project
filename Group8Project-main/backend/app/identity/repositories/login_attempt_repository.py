"""Failed logins, kept in the database because each Lambda copy has its own memory."""
from datetime import timedelta

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.datetime_utils import utcnow
from app.identity.models.login_attempt import LoginAttempts

WINDOW = timedelta(minutes=15)
KEEP_FOR = timedelta(days=1)

# Someone guessing one account's password from one place.
MAX_FOR_EMAIL_AND_ADDRESS = 5
# One account guessed from many places. Higher, so a stranger cannot easily lock someone out.
MAX_FOR_EMAIL = 20
# One place guessing many accounts. Higher, because a campus or office shares one address.
MAX_FOR_ADDRESS = 30


class LoginAttemptRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def _failures(self, *conditions) -> int:
        result = await self._db.execute(
            select(func.count())
            .select_from(LoginAttempts)
            .where(
                LoginAttempts.successful.is_(False),
                LoginAttempts.attempted_at >= utcnow() - WINDOW,
                *conditions,
            )
        )
        return result.scalar_one()

    async def is_blocked(self, email: str, address: str) -> bool:
        same_email = LoginAttempts.email == email
        same_address = LoginAttempts.ip_address == address[:45]
        return (
            await self._failures(same_email, same_address) >= MAX_FOR_EMAIL_AND_ADDRESS
            or await self._failures(same_email) >= MAX_FOR_EMAIL
            or await self._failures(same_address) >= MAX_FOR_ADDRESS
        )

    async def record_failure(self, email: str, address: str) -> None:
        now = utcnow()
        await self._db.execute(delete(LoginAttempts).where(LoginAttempts.attempted_at < now - KEEP_FOR))
        self._db.add(LoginAttempts(email=email[:255], ip_address=address[:45], successful=False, attempted_at=now))
        await self._db.commit()

    async def clear(self, email: str, address: str | None = None) -> None:
        """Forget failures after a correct password, or after a reset proved who this is."""
        conditions = [LoginAttempts.email == email]
        if address is not None:
            conditions.append(LoginAttempts.ip_address == address[:45])
        await self._db.execute(delete(LoginAttempts).where(*conditions))
        await self._db.commit()
