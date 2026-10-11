from typing import Annotated

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.identity.api.dependencies import CurrentSessionId, CurrentUser
from app.identity.schemas.session import SessionListResponse
from app.identity.services.session_service import SessionService

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("", response_model=SessionListResponse)
async def list_sessions(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
    current_session_id: CurrentSessionId,
) -> SessionListResponse:
    return await SessionService(db).list_sessions(current_user, current_session_id)


@router.delete("/{session_id}", status_code=204)
async def revoke_session(
    session_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
) -> Response:
    await SessionService(db).revoke(session_id, current_user)
    return Response(status_code=204)


@router.delete("", status_code=204)
async def revoke_all_sessions(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
) -> Response:
    await SessionService(db).revoke_all(current_user)
    return Response(status_code=204)
