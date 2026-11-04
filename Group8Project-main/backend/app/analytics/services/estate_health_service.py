"""EstateHealthService — runs the 5-pillar engine and shapes the response.

No estate/membership model needed: scores the whole Valora system (all
units, all complaints, all work orders) as a single "estate". The engine
itself is identical to VANTAGE — pure functions, Decimal-only, no IO.
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.engine.living_score import calculate_living_score
from app.analytics.repositories.estate_health_repository import EstateHealthRepository
from app.analytics.schemas.estate_health import (
    ComponentResponse,
    EstateHealthResponse,
)


class EstateHealthService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = EstateHealthRepository(db)

    async def get_health(self) -> EstateHealthResponse:
        """Run the 5-pillar engine over the last 90 days and return the result."""
        as_of = datetime.now(timezone.utc)
        inputs = await self._repo.build_inputs(as_of=as_of)
        result = calculate_living_score(inputs)

        components = [
            ComponentResponse(
                key=c.key,
                label=c.label,
                weight=float(c.weight),
                status=c.status,
                score=c.score,
                benchmark=c.benchmark,
                contribution=c.contribution,
                lost_points=c.lost_points,
                explanation=c.explanation,
                recommendation=c.recommendation,
            )
            for c in result.components
        ]
        drivers = [
            ComponentResponse(
                key=c.key,
                label=c.label,
                weight=float(c.weight),
                status=c.status,
                score=c.score,
                benchmark=c.benchmark,
                contribution=c.contribution,
                lost_points=c.lost_points,
                explanation=c.explanation,
                recommendation=c.recommendation,
            )
            for c in result.drivers
        ]

        return EstateHealthResponse(
            engine_version=result.engine_version,
            as_of=as_of,
            window_start=result.window_start,
            window_end=result.window_end,
            overall_score=result.overall_score,
            status=result.status,
            measured_weight=float(result.measured_weight),
            unit_count=inputs.unit_count,
            components=components,
            drivers=drivers,
        )
