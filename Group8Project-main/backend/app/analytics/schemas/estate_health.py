"""Estate Health schemas — Pydantic contracts for the 5-pillar Living Score API."""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict

ScoreStatus = Literal["scored", "insufficient_data"]
ComponentStatus = Literal["measured", "insufficient_data"]

_CFG = ConfigDict(from_attributes=True)


class ComponentResponse(BaseModel):
    """One pillar's outcome, exactly as the engine described it."""
    model_config = _CFG

    key: str
    label: str
    weight: float
    status: ComponentStatus
    score: Decimal | None
    benchmark: str
    contribution: Decimal | None
    lost_points: Decimal | None
    explanation: str
    recommendation: str | None


class EstateHealthResponse(BaseModel):
    """The full Living Score snapshot for the system."""
    model_config = _CFG

    engine_version: str
    as_of: datetime
    window_start: datetime
    window_end: datetime
    overall_score: Decimal | None
    status: ScoreStatus
    measured_weight: float
    unit_count: int
    components: list[ComponentResponse]
    # The measured pillars ordered by lost_points (biggest drag first).
    drivers: list[ComponentResponse]
