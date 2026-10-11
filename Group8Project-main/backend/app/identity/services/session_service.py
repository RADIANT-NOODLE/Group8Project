from sqlalchemy.ext.asyncio import AsyncSession

from app.common.datetime_utils import utcnow
from app.core.exceptions import NotFoundException
from app.identity.models.user import User
from app.identity.repositories.session_repository import SessionRepository
from app.identity.schemas.session import SessionListResponse, SessionResponse


class SessionService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = SessionRepository(db)

    async def list_sessions(self, user: User, current_session_id: int) -> SessionListResponse:
        sessions = await self._repo.list_active_for_user(user.user_id, utcnow())
        items = []
        for session in sessions:
            item = SessionResponse.model_validate(session)
            item.is_current = session.session_id == current_session_id
            items.append(item)
        return SessionListResponse(count=len(items), sessions=items)

    async def revoke(self, session_id: int, user: User) -> None:
        # scoped to the caller: another user's session looks exactly like a missing one
        session = await self._repo.get_for_user(session_id, user.user_id)
        if session is None:
            raise NotFoundException(f"Session with id {session_id} was not found.")
        await self._repo.delete(session)

    async def revoke_all(self, user: User) -> int:
        return await self._repo.delete_all_for_user(user.user_id)
