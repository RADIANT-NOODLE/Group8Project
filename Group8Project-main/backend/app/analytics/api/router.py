from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.schemas.living_score import LivingScoreResponse
from app.analytics.schemas.valuation import RentalYieldResponse, RoiResponse, ValuationResponse
from app.analytics.services.living_score_service import LivingScoreService
from app.analytics.services.valuation_service import ValuationService
from app.db.session import get_db
from app.identity.api.dependencies import CurrentUser

router = APIRouter(prefix="/analytics", tags=["analytics"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
PositiveMoney = Annotated[Decimal | None, Query(gt=0, max_digits=14, decimal_places=2)]
NonNegativeMoney = Annotated[Decimal | None, Query(ge=0, max_digits=14, decimal_places=2)]


@router.get("/status")
async def analytics_status():
    return {
        "module": "analytics",
        "status": "active",
        "endpoints": ["valuation", "roi", "rental-yield", "living-score"],
    }


@router.get("/valuation/{unit_id}", response_model=ValuationResponse)
async def get_valuation(
    unit_id: int,
    db: DbSession,
    _user: CurrentUser,
) -> ValuationResponse:
    return await ValuationService(db).get_valuation(unit_id)


@router.get("/roi/{unit_id}", response_model=RoiResponse)
async def get_roi(
    unit_id: int,
    db: DbSession,
    _user: CurrentUser,
    growth_rate_pct: Annotated[
        Decimal | None, Query(ge=-20, le=30, description="Annual capital growth, % (default 4)")
    ] = None,
    monthly_rent: NonNegativeMoney = None,
    monthly_expenses: NonNegativeMoney = None,
    property_value: PositiveMoney = None,
) -> RoiResponse:
    return await ValuationService(db).get_roi(
        unit_id,
        growth_rate_pct=growth_rate_pct,
        monthly_rent=monthly_rent,
        monthly_expenses=monthly_expenses,
        property_value=property_value,
    )


@router.get("/rental-yield/{unit_id}", response_model=RentalYieldResponse)
async def get_rental_yield(
    unit_id: int,
    db: DbSession,
    _user: CurrentUser,
    monthly_rent: NonNegativeMoney = None,
    property_value: PositiveMoney = None,
) -> RentalYieldResponse:
    return await ValuationService(db).get_rental_yield(
        unit_id, monthly_rent=monthly_rent, property_value=property_value
    )


@router.get("/living-score/{unit_id}", response_model=LivingScoreResponse)
async def get_living_score(unit_id: int, db: DbSession) -> LivingScoreResponse:
    return await LivingScoreService(db).get_living_score(unit_id)
