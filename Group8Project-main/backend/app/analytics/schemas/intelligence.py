from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class IntelligenceFinding(BaseModel):
    id: str
    severity: Literal["attention", "urgent"]
    title: str
    detail: str
    evidence: str


class IntelligenceRecord(BaseModel):
    id: int
    kind: Literal["complaint", "work_order"]
    title: str
    status: str
    unit_no: str
    created_at: datetime | None


class IntelligenceResponse(BaseModel):
    scope: str
    as_of: datetime
    role: str
    units_count: int
    complaints_total: int
    open_complaints: int
    resolved_complaints: int
    work_orders_total: int
    active_work_orders: int
    overdue_work_orders: int
    findings: list[IntelligenceFinding]
    recent_records: list[IntelligenceRecord]


class AskIntelligenceRequest(BaseModel):
    question: str = Field(min_length=3, max_length=500)


class AskIntelligenceResponse(BaseModel):
    answer: str
    evidence: list[str]
