"""Forgot password, from request to new password, through a small local mail server.

Uses the real smtplib and a throwaway in-memory SQLite database (needs aiosqlite).
"""
import asyncio
import email
import importlib.util
import re
import smtplib
import socketserver
import ssl
import threading
from email import policy
from pathlib import Path
from urllib.parse import unquote

import pytest

pytest.importorskip("aiosqlite")

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.main  # noqa: E402  (loads every model and route)
from app.core import email as email_module  # noqa: E402
from app.core.config import get_settings  # noqa: E402
from app.core.security import hash_password, verify_password  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.identity.models.login_attempt import LoginAttempts  # noqa: E402
from app.identity.models.user import User  # noqa: E402

ADDRESS = "sam@example.com"
SITE = "https://site.example"


class FakeMailServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

    def __init__(self):
        self.mail = []
        super().__init__(("127.0.0.1", 0), MailHandler)


class MailHandler(socketserver.StreamRequestHandler):
    """Just enough of the mail protocol for smtplib to deliver a message."""

    def say(self, line):
        self.wfile.write(line.encode() + b"\r\n")

    def handle(self):
        self.say("220 test")
        while line := self.rfile.readline():
            command = line[:4].upper()
            if command == b"DATA":
                self.say("354 go")
                body = b""
                while (part := self.rfile.readline()) != b".\r\n":
                    body += part
                self.server.mail.append(email.message_from_bytes(body, policy=policy.default))
                self.say("250 ok")
            elif command == b"QUIT":
                self.say("221 bye")
                return
            else:
                self.say("250 ok")


@pytest.fixture()
def mail_server(monkeypatch):
    server = FakeMailServer()
    threading.Thread(target=server.serve_forever, daemon=True).start()
    settings = get_settings()
    monkeypatch.setattr(settings, "SMTP_HOST", "127.0.0.1")
    monkeypatch.setattr(settings, "SMTP_PORT", server.server_address[1])
    monkeypatch.setattr(settings, "SMTP_USER", "")
    monkeypatch.setattr(settings, "SMTP_USE_TLS", False)
    monkeypatch.setattr(settings, "SMTP_FROM", "site@example.com")
    monkeypatch.setattr(settings, "FRONTEND_URL", SITE)
    monkeypatch.setattr(settings, "EXPOSE_RESET_LINK", False)
    yield server
    server.shutdown()
    server.server_close()


@pytest.fixture()
def sessions():
    engine = create_async_engine(
        "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
    )
    maker = async_sessionmaker(engine, expire_on_commit=False)

    async def build():
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all, tables=[User.__table__, LoginAttempts.__table__])
        async with maker() as db:
            db.add(User(user_id=1, full_name="Sam", email=ADDRESS, role="resident",
                        password_hash=hash_password("Old@Password1"), hoa_approved=True))
            await db.commit()

    asyncio.run(build())

    async def override_db():
        async with maker() as db:
            yield db

    app.main.app.dependency_overrides[get_db] = override_db
    yield maker
    app.main.app.dependency_overrides.clear()
    asyncio.run(engine.dispose())


def client():
    return TestClient(app.main.app)


def forgot(address):
    return client().post("/api/v1/auth/forgot-password", json={"email": address})


def password_hash(maker):
    async def read():
        async with maker() as db:
            return (await db.get(User, 1)).password_hash

    return asyncio.run(read())


def test_the_link_arrives_and_sets_a_new_password(sessions, mail_server):
    assert forgot(ADDRESS).status_code == 200

    assert len(mail_server.mail) == 1
    message = mail_server.mail[0]
    assert message["To"] == ADDRESS
    assert message["From"] == "site@example.com"
    text = message.get_content()
    match = re.search(re.escape(SITE) + r"/reset-password\?token=(\S+)", text)
    assert match, text
    token = unquote(match.group(1))

    response = client().post("/api/v1/auth/reset-password", json={"token": token, "new_password": "New@Password1"})
    assert response.status_code == 200
    assert verify_password("New@Password1", password_hash(sessions))

    # the link only works once
    again = client().post("/api/v1/auth/reset-password", json={"token": token, "new_password": "Other@Password1"})
    assert again.status_code == 401


def test_an_unknown_address_gets_the_same_answer_and_no_email(sessions, mail_server):
    known = forgot(ADDRESS).json()
    unknown = forgot("nobody@example.com").json()

    assert known == unknown
    assert "dev_reset_link" not in known or known["dev_reset_link"] is None
    assert len(mail_server.mail) == 1


def test_a_mail_failure_does_not_reveal_anything(sessions, mail_server, monkeypatch):
    monkeypatch.setattr(get_settings(), "SMTP_PORT", 1)  # nothing listens here
    unknown = forgot("nobody@example.com")
    known = forgot(ADDRESS)

    assert known.status_code == unknown.status_code == 200
    assert known.json() == unknown.json()


class RecordingSmtp:
    """Stands in for smtplib.SMTP, to see how the connection is secured."""

    calls = []
    login_error = None

    def __init__(self, host, port, timeout=None):
        type(self).calls.append(("connect", host, port))

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def starttls(self, context=None):
        type(self).calls.append(("starttls", context))

    def login(self, user, password):
        if type(self).login_error:
            raise type(self).login_error
        type(self).calls.append(("login", user, password))

    def send_message(self, message):
        type(self).calls.append(("send", message["To"]))


@pytest.fixture()
def recording(monkeypatch):
    RecordingSmtp.calls = []
    RecordingSmtp.login_error = None
    monkeypatch.setattr(smtplib, "SMTP", RecordingSmtp)
    return RecordingSmtp


def assert_checks_the_server(calls):
    context = next(call[1] for call in calls if call[0] == "starttls")
    assert context.verify_mode == ssl.CERT_REQUIRED
    assert context.check_hostname is True
    # secured before the password goes over
    names = [call[0] for call in calls]
    assert names.index("starttls") < names.index("login") < names.index("send")


def test_the_site_checks_who_the_mail_server_is(recording, monkeypatch):
    settings = get_settings()
    for name, value in (("SMTP_HOST", "mail.example"), ("SMTP_USER", "site"), ("SMTP_PASSWORD", "secret"),
                        ("SMTP_USE_TLS", True), ("SMTP_FROM", "site@example.com")):
        monkeypatch.setattr(settings, name, value)

    assert asyncio.run(email_module.send_password_reset_email(ADDRESS, f"{SITE}/reset-password?token=abc")) is True
    assert_checks_the_server(recording.calls)


# ---------------------------------------------------------------- deploy.py --test-email


def load_deploy():
    path = Path(__file__).resolve().parents[2] / "deploy" / "deploy.py"
    spec = importlib.util.spec_from_file_location("valora_deploy", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


MAIL_SETTINGS = {
    "SMTP_HOST": "smtp.gmail.com", "SMTP_PORT": "587", "SMTP_USER": "site@gmail.com",
    "SMTP_PASSWORD": "abcdefghijklmnop", "SMTP_FROM": "site@gmail.com",
}


def test_the_deploy_test_email_is_sent_securely(recording):
    load_deploy().send_test_email(dict(MAIL_SETTINGS), "me@example.com")

    assert_checks_the_server(recording.calls)
    assert ("send", "me@example.com") in recording.calls


def test_a_refused_login_explains_itself_and_hides_the_password(recording, capsys):
    recording.login_error = smtplib.SMTPAuthenticationError(535, b"bad")

    with pytest.raises(SystemExit) as stopped:
        load_deploy().send_test_email(dict(MAIL_SETTINGS), "me@example.com")

    output = capsys.readouterr()
    text = output.out + output.err + str(stopped.value)
    assert "app password" in text
    assert MAIL_SETTINGS["SMTP_PASSWORD"] not in text


def test_app_password_spaces_are_removed(tmp_path, monkeypatch):
    deploy = load_deploy()
    env_file = tmp_path / "production.env"
    env_file.write_text("SMTP_HOST=smtp.gmail.com\nSMTP_PASSWORD=abcd efgh ijkl mnop\n", encoding="utf-8")
    monkeypatch.setattr(deploy, "ENV_FILE", env_file)

    assert deploy.read_settings()["SMTP_PASSWORD"] == "abcdefghijklmnop"


@pytest.mark.parametrize(
    "changes",
    [
        {"SMTP_PASSWORD": ""},
        {"SMTP_USER": ""},
        {"SMTP_FROM": "no-reply@valora.local"},
        {"SMTP_FROM": ""},
        {"SMTP_HOST": ""},  # a login with nowhere to send
    ],
)
def test_half_finished_email_settings_stop_the_deploy(changes):
    with pytest.raises(SystemExit):
        load_deploy().check_email_settings({**MAIL_SETTINGS, **changes})


def test_blank_email_settings_only_warn(capsys):
    load_deploy().check_email_settings({"SMTP_HOST": "", "SMTP_USER": "", "SMTP_PASSWORD": ""})
    assert "will not be sent" in capsys.readouterr().out
