"""Estate Health was removed. Its address must stay gone, and the unit Living Score must stay."""
from fastapi.testclient import TestClient

from app.main import app


def test_the_estate_health_address_is_gone():
    assert TestClient(app).get("/api/v1/analytics/estate-health").status_code == 404


def test_the_unit_living_score_is_still_listed():
    assert TestClient(app).get("/api/v1/analytics/status").json()["endpoints"] == ["living-score"]
