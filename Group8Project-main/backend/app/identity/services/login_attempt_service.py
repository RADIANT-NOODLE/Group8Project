from datetime import timedelta
from typing import Literal

from sqlalchemy.ext.asyncio import AsyncSession

from app.common.datetime_utils import utcnow
from app.identity.repositories.login_attempt_repository import LoginAttemptRepository
from app.identity.schemas.session import LoginAttemptResponse, PaginatedLoginAttemptsResponse

AttemptFilter = Literal["failed", "success", "all"]

_STATUS_TO_FLAG = {"failed": False, "success": True, "all": None}


class LoginAttemptService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = LoginAttemptRepository(db)

    async def list_attempts(
        self,
        *,
        page: int,
        page_size: int,
        status: AttemptFilter = "failed",
        email: str | None = None,
        since_hours: int | None = None,
    ) -> PaginatedLoginAttemptsResponse:
        filters = dict(
            successful=_STATUS_TO_FLAG[status],
            email=email,
            since=utcnow() - timedelta(hours=since_hours) if since_hours else None,
        )
        attempts = await self._repo.search(offset=(page - 1) * page_size, limit=page_size, **filters)
        total = await self._repo.count(**filters)
        return PaginatedLoginAttemptsResponse(
            count=total,
            page=page,
            page_size=page_size,
            attempts=[LoginAttemptResponse.model_validate(a) for a in attempts],
        )
      
