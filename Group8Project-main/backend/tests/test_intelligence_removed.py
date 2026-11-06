"""VALORA Intelligence was removed. Its addresses must stay gone, and other analytics must stay."""
from fastapi.testclient import TestClient

from app.main import app


def test_intelligence_addresses_are_gone():
    client = TestClient(app)
    assert client.get("/api/v1/analytics/intelligence").status_code == 404
    assert client.post("/api/v1/analytics/intelligence/ask", json={"question": "hi"}).status_code == 404


def test_other_analytics_remain():
    status = TestClient(app).get("/api/v1/analytics/status").json()
    assert status["endpoints"] == ["living-score"]
