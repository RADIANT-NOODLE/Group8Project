import pytest
from datetime import datetime, timezone
from decimal import Decimal
from pydantic import ValidationError

from app.common.enums import UserRole, WorkOrderStatus
from app.community.schemas.work_order import (
    WorkOrderCreate,
    WorkOrderRating,
    WorkOrderResponse,
    WorkOrderUpdate,
)


def test_work_order_status_enum():
    assert WorkOrderStatus.assigned.value == "assigned"
    assert WorkOrderStatus.in_progress.value == "in_progress"
    assert WorkOrderStatus.completed.value == "completed"
    assert WorkOrderStatus.cancelled.value == "cancelled"


def test_service_provider_role_enum():
    assert UserRole.service_provider.value == "service_provider"


def test_work_order_response_fields():
    data = {
        "work_order_id": 42,
        "complaint_id": 10,
        "provider_id": 5,
        "assigned_at": datetime.now(timezone.utc),
        "resolved_at": None,
        "job_cost": Decimal("750.50"),
        "resident_rating": None,
        "completion_notes": None,
        "status": "assigned",
        "estimated_completion_date": None,
        "actual_completion_date": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "complaint_category": "Plumbing",
        "complaint_description": "Burst pipe under sink",
        "unit_id": 101,
    }
    resp = WorkOrderResponse(**data)
    assert resp.work_order_id == 42
    assert resp.complaint_category == "Plumbing"
    assert resp.complaint_description == "Burst pipe under sink"
    assert resp.unit_id == 101
    dump = resp.model_dump(by_alias=True)
    assert dump["id"] == 42
    assert dump["complaint_category"] == "Plumbing"


def test_work_order_update_validation():
    update = WorkOrderUpdate(
        status=WorkOrderStatus.in_progress,
        completion_notes="Work started on site.",
        job_cost=Decimal("1200.00"),
    )
    assert update.status == WorkOrderStatus.in_progress
    assert update.completion_notes == "Work started on site."
    assert update.job_cost == Decimal("1200.00")


def test_work_order_rating_validation():
    assert WorkOrderRating(rating=5).rating == 5
    assert WorkOrderRating(rating=1).rating == 1
    with pytest.raises(ValidationError):
        WorkOrderRating(rating=0)
    with pytest.raises(ValidationError):
        WorkOrderRating(rating=6)
