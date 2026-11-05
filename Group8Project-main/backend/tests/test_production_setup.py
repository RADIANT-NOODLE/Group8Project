"""Settings and behaviour that only apply on the live site.

Each case starts a fresh Python, because these settings are read once at import.
No database is contacted: the address below goes nowhere.
"""
import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

BACKEND = Path(__file__).resolve().parent.parent
GOOD_SECRET = "a-long-random-production-value-0123456789abcdefgh"


def run(code, **overrides):
    env = {
        **os.environ,
        "ENVIRONMENT": "production",
        "AWS_LAMBDA_FUNCTION_NAME": "valora-test",
        "DATABASE_URL": "postgresql+asyncpg://nobody:nobody@127.0.0.1:1/none",
        "SECRET_KEY": GOOD_SECRET,
        "EXPOSE_RESET_LINK": "false",
        **overrides,
    }
    return subprocess.run([sys.executable, "-c", code], cwd=BACKEND, env=env, capture_output=True, text=True, timeout=120)


CALL = """
import json
from app.lambda_handler import handler

def call(method, path, headers=None):
    event = {
        "version": "2.0", "rawPath": path, "rawQueryString": "", "headers": {"host": "example.lambda-url", **(headers or {})},
        "requestContext": {"http": {"method": method, "path": path, "sourceIp": "1.2.3.4", "protocol": "HTTP/1.1"},
                           "domainName": "example.lambda-url", "stage": "$default", "accountId": "1", "apiId": "a",
                           "requestId": "r", "routeKey": "$default", "time": "t", "timeEpoch": 0},
        "isBase64Encoded": False,
    }
    return handler(event, type("Context", (), {"aws_request_id": "r"})())
"""


def test_lambda_answers_requests_on_separate_event_loops():
    result = run(CALL + """
first = call("GET", "/health")
second = call("GET", "/health")
print(json.dumps([first["statusCode"], json.loads(first["body"]), second["statusCode"]]))
""")
    assert result.returncode == 0, result.stderr
    assert json.loads(result.stdout.strip().splitlines()[-1]) == [200, {"status": "ok", "environment": "production"}, 200]


@pytest.mark.parametrize("path", ["/docs", "/redoc", "/openapi.json"])
def test_the_live_site_has_no_public_route_map(path):
    result = run(CALL + f'print(call("GET", "{path}")["statusCode"])')
    assert result.returncode == 0, result.stderr
    assert result.stdout.strip().splitlines()[-1] == "404"


def test_protected_routes_still_refuse_without_a_login():
    result = run(CALL + 'print(call("GET", "/api/v1/auth/me")["statusCode"])')
    assert result.stdout.strip().splitlines()[-1] == "401", result.stderr


def test_other_websites_get_no_cors_permission():
    result = run(CALL + """
reply = call("OPTIONS", "/api/v1/auth/login", {"origin": "http://localhost:4173", "access-control-request-method": "POST"})
print(reply["statusCode"], reply["headers"].get("access-control-allow-origin", "none"))
""")
    assert result.stdout.strip().splitlines()[-1] == "400 none", result.stderr


def test_lambda_uses_no_connection_pool():
    result = run("from app.db.session import engine; print(type(engine.pool).__name__)")
    assert result.stdout.strip().splitlines()[-1] == "NullPool", result.stderr


def test_a_laptop_keeps_its_connection_pool():
    env = {key: value for key, value in os.environ.items() if key != "AWS_LAMBDA_FUNCTION_NAME"}
    env.update(DATABASE_URL="postgresql+asyncpg://nobody:nobody@127.0.0.1:1/none", SECRET_KEY=GOOD_SECRET, ENVIRONMENT="development")
    result = subprocess.run(
        [sys.executable, "-c", "from app.db.session import engine; print(type(engine.pool).__name__)"],
        cwd=BACKEND, env=env, capture_output=True, text=True, timeout=120,
    )
    assert result.stdout.strip().splitlines()[-1] != "NullPool", result.stderr


@pytest.mark.parametrize(
    "overrides, message",
    [
        ({"EXPOSE_RESET_LINK": "true"}, "EXPOSE_RESET_LINK"),
        ({"SECRET_KEY": "short"}, "SECRET_KEY"),
        ({"SECRET_KEY": "please-change-this-to-something-long-and-random-now"}, "SECRET_KEY"),
    ],
)
def test_unsafe_production_settings_stop_the_app(overrides, message):
    result = run("from app.core.config import get_settings; get_settings()", **overrides)
    assert result.returncode != 0
    assert message in result.stderr


def test_the_same_settings_are_fine_in_development():
    result = run("from app.core.config import get_settings; print(get_settings().EXPOSE_RESET_LINK)", ENVIRONMENT="development", EXPOSE_RESET_LINK="true", SECRET_KEY="short")
    assert result.returncode == 0, result.stderr


@pytest.mark.parametrize(
    "on_lambda, expected",
    [(True, "9.9.9.9"), (False, "1.2.3.4")],
)
def test_limits_only_trust_the_address_header_on_aws(on_lambda, expected):
    code = """
from types import SimpleNamespace
from app.core.client_address import client_address
request = SimpleNamespace(headers={"x-valora-viewer-ip": "9.9.9.9"}, client=SimpleNamespace(host="1.2.3.4"))
print(client_address(request))
"""
    if on_lambda:
        result = run(code)
    else:
        env = {key: value for key, value in os.environ.items() if key != "AWS_LAMBDA_FUNCTION_NAME"}
        env.update(DATABASE_URL="postgresql+asyncpg://nobody:nobody@127.0.0.1:1/none", SECRET_KEY=GOOD_SECRET)
        result = subprocess.run([sys.executable, "-c", code], cwd=BACKEND, env=env, capture_output=True, text=True, timeout=120)
    assert result.stdout.strip().splitlines()[-1] == expected, result.stderr
