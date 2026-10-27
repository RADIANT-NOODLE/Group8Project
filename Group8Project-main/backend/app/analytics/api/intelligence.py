from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.repositories.intelligence_repository import IntelligenceRepository
from app.analytics.schemas.intelligence import (
    AskIntelligenceRequest,
    AskIntelligenceResponse,
    IntelligenceResponse,
)
from app.analytics.services.intelligence_service import IntelligenceService
from app.db.session import get_db
from app.identity.api.dependencies import CurrentUser

router = APIRouter(prefix="/intelligence", tags=["analytics"])
DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("", response_model=IntelligenceResponse)
async def get_intelligence(
    db: DbSession,
    current_user: CurrentUser,
) -> IntelligenceResponse:
    return await IntelligenceService(IntelligenceRepository(db)).get_summary(current_user)


@router.post("/ask", response_model=AskIntelligenceResponse)
async def ask_intelligence(
    payload: AskIntelligenceRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> AskIntelligenceResponse:
    return await IntelligenceService(IntelligenceRepository(db)).answer(
        current_user, payload.question
    )
