from datetime import datetime
from types import SimpleNamespace

from app.community.api.resident_directory import format_record
from app.community.schemas.resident_directory import ResidentDirectoryResponse


def _record(phoneno):
    return SimpleNamespace(
        id=1,
        user_id=2,
        property_id=3,
        occupancy="Occupied",
        status="Active",
        notes=None,
        created_at=datetime(2026, 11, 5),
        user=SimpleNamespace(
            full_name="Test Resident",
            email="resident@example.invalid",
            role="resident",
            phoneno=phoneno,
        ),
        property=SimpleNamespace(
            unit_no="101",
            complex_name="Silverleaf Estates",
            street_address="12 Main Road",
        ),
    )


def _serialised(record):
    return ResidentDirectoryResponse.model_validate(format_record(record)).model_dump()


def test_phone_comes_from_the_linked_account():
    assert _serialised(_record("0821234567"))["phone"] == "0821234567"


def test_account_without_a_phone_stays_empty():
    assert _serialised(_record(None))["phone"] is None


def test_record_without_a_linked_account_has_no_phone():
    record = _record("0821234567")
    record.user = None
    assert _serialised(record)["phone"] is None
