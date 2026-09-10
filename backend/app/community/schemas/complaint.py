from decimal import Decimal

from pydantic import BaseModel


class ComplaintStatsResponse(BaseModel):
    total: int
    by_status: dict[str, int]
    by_category: dict[str, int]
    resolution_rate_pct: Decimal
    avg_resolution_hours: Decimal | None
