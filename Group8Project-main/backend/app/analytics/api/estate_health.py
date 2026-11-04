"""Estate Health API — GET /analytics/estate-health

Returns the full 5-pillar Living Score (v1.0.0) for the entire Valora
system over the last 90-day rolling window. Identical engine to VANTAGE.
Any authenticated user may read it; HOA admins may request a forced
recalculation (which is simply a fresh calculation — no snapshots stored,
consistent with the Group8 architecture which has no estate snapshot table).
"""
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.schemas.estate_health import EstateHealthResponse
from app.analytics.services.estate_health_service import EstateHealthService
from app.db.session import get_db
from app.identity.api.dependencies import CurrentUser

router = APIRouter(prefix="/estate-health", tags=["analytics"])
DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("", response_model=EstateHealthResponse)
async def get_estate_health(
    db: DbSession,
    current_user: CurrentUser,
) -> EstateHealthResponse:
    """Return the 5-pillar Living Score for the whole system.

    Scores the last 90-day window ending now. Any authenticated user may
    read this; the result is computed on demand (no stored snapshots needed).
    """
    return await EstateHealthService(db).get_health()
