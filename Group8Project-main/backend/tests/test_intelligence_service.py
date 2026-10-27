from types import SimpleNamespace

import pytest

from app.analytics.services.intelligence_service import IntelligenceService
from app.core.exceptions import ForbiddenException


class StubRepository:
    async def get_unit_ids(self, _actor):
        return [11, 12]

    async def get_property_names(self, _unit_ids):
        return ["Maple Court"]

    async def complaint_counts(self, _unit_ids):
        return {"total": 8, "open": 3, "resolved": 5}

    async def work_order_counts(self, _unit_ids, _now):
        return {"total": 4, "active": 2, "overdue": 1}

    async def recent_records(self, _unit_ids):
        return []


@pytest.mark.asyncio
async def test_summary_builds_findings_from_current_record_counts():
    result = await IntelligenceService(StubRepository()).get_summary(
        SimpleNamespace(role="hoa_admin", unit_no=None)
    )

    assert result.scope == "Maple Court"
    assert result.units_count == 2
    assert result.open_complaints == 3
    assert result.overdue_work_orders == 1
    assert [finding.severity for finding in result.findings] == ["urgent", "attention"]


@pytest.mark.asyncio
async def test_question_answer_includes_record_evidence():
    result = await IntelligenceService(StubRepository()).answer(
        SimpleNamespace(role="hoa_admin", unit_no=None),
        "Are any work orders overdue?",
    )

    assert "2 active work orders" in result.answer
    assert "1 past their recorded due date" in result.answer
    assert result.evidence == ["Work-order records: 4 total; 2 active; 1 overdue."]


@pytest.mark.asyncio
async def test_service_provider_without_supported_account_link_is_denied():
    with pytest.raises(ForbiddenException, match="provider-to-user assignment"):
        await IntelligenceService(StubRepository()).get_summary(
            SimpleNamespace(role="service_provider", unit_no=None)
        )
