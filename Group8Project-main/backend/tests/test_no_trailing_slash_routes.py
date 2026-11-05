"""API addresses must not end in a slash.

On AWS the Lambda function URL removes a trailing slash, so a route written with
one answers with a redirect to the Lambda's own address, which browsers block.
"""
import re
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

APP_FOLDER = Path(__file__).resolve().parents[1] / "app"
# an old file nothing imports, so its routes never run
UNUSED_FILE = APP_FOLDER / "api" / "users.py"
ROUTE_WITH_SLASH = re.compile(r"""router\.\w+\(\s*["'][^"']*/["']""")


def test_no_router_route_ends_in_a_slash():
    found = [
        f"{path.relative_to(APP_FOLDER)}: {match.group(0)}"
        for path in APP_FOLDER.rglob("*.py")
        if path != UNUSED_FILE
        for match in ROUTE_WITH_SLASH.finditer(path.read_text(encoding="utf-8"))
    ]
    assert found == []


def test_users_list_answers_without_a_redirect():
    response = TestClient(app).get("/api/v1/users", follow_redirects=False)
    assert response.status_code == 401
