"""Living Score API — deterministic 3-pillar score for a property unit."""
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.schemas.living_score import LivingScoreResponse
from app.analytics.services.living_score_service import LivingScoreService
from app.db.session import get_db
from app.identity.api.dependencies import CurrentUser

router = APIRouter(prefix="/living-score", tags=["analytics"])
DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("/{unit_id}", response_model=LivingScoreResponse)
async def get_living_score(
    unit_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> LivingScoreResponse:
    """Return the Living Score for a property unit.

    The score is a weighted composite of three pillars:
    - Community health (40 %) — complaint volume and resolution rate.
    - Maintenance quality (30 %) — work-order completion and resident ratings.
    - Provider reliability (30 %) — average rating of assigned service providers.
    """
    service = LivingScoreService(db)
    return await service.get_living_score(unit_id)
