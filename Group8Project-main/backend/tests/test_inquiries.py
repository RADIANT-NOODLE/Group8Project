"""Public enquiries: who may send one, what is required, and which agent receives it.

No database needed: the session is replaced with an in-memory stand-in.
"""
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

import app.main  # noqa: F401  (loads every model and route)
from app.core.security import create_access_token
from app.db.session import get_db
from app.property.api import inquiries

VALID = {
    "property_id": 4,
    "buyer_name": "Sam Buyer",
    "buyer_email": "sam@example.com",
    "buyer_contact": "082 123 4567",
    "message": "May I view it?",
}
LISTING = SimpleNamespace(agent_id=10)


class FakeResult:
    def __init__(self, value):
        self.value = value

    def scalars(self):
        return self

    def first(self):
        return self.value


class FakeDb:
    """Answers the listing query, then the assigned-agent query, and keeps what was saved."""

    def __init__(self, listing=LISTING, assigned_agent_id=None):
        self.answers = [listing, assigned_agent_id]
        self.saved = []

    async def execute(self, _statement):
        return FakeResult(self.answers.pop(0))

    def add(self, record):
        self.saved.append(record)

    async def commit(self):
        pass

    async def refresh(self, record):
        record.inquiry_id = 1


@pytest.fixture(autouse=True)
def reset_limit():
    inquiries._recent_enquiries.clear()
    yield
    app.main.app.dependency_overrides.clear()


def send(db, body=VALID, headers=None):
    async def fake_db():
        yield db

    app.main.app.dependency_overrides[get_db] = fake_db
    return TestClient(app.main.app).post("/api/v1/inquiries", json=body, headers=headers or {})


def test_guest_can_send_and_it_goes_to_the_listing_agent():
    db = FakeDb()
    assert send(db).status_code == 201
    saved = db.saved[0]
    assert (saved.agent_id, saved.buyer_id, saved.status) == (10, None, "New")
    assert (saved.buyer_name, saved.buyer_email, saved.buyer_contact) == ("Sam Buyer", "sam@example.com", "+27821234567")


def test_the_assigned_agent_takes_priority_over_the_listing_agent():
    db = FakeDb(assigned_agent_id=22)
    assert send(db).status_code == 201
    assert db.saved[0].agent_id == 22


def test_the_browser_cannot_choose_the_agent():
    db = FakeDb()
    assert send(db, {**VALID, "agent_id": 999}).status_code == 201
    assert db.saved[0].agent_id == 10


def test_unlisted_property_is_refused():
    db = FakeDb(listing=None)
    assert send(db).status_code == 404
    assert db.saved == []


@pytest.mark.parametrize(
    "change",
    [
        {"buyer_name": " "},
        {"buyer_name": "A"},
        {"buyer_name": "12345"},
        {"buyer_name": "Sam 2"},
        {"buyer_name": "!!!"},
        {"buyer_email": ""},
        {"buyer_email": "not-an-email"},
        {"buyer_email": "sam@example"},
        {"buyer_email": "sam@example.c"},
        {"buyer_email": "sam@@example.com"},
        {"buyer_email": "sam@example..com"},
        {"buyer_email": "sam smith@example.com"},
        {"buyer_contact": "1234567"},
        {"buyer_contact": "082 123 456"},
        {"buyer_contact": "082 123 45678"},
        {"buyer_contact": "0021234567"},
        {"buyer_contact": ""},
        {"buyer_contact": "123"},
        {"buyer_contact": "call me maybe"},
        {"buyer_contact": "1" * 16},
    ],
)
def test_name_email_and_phone_are_required_and_checked(change):
    db = FakeDb()
    assert send(db, {**VALID, **change}).status_code == 422
    assert db.saved == []


@pytest.mark.parametrize(
    "name", ["Sam", "Sam Smith", "Mary-Jane O'Neil", "Thandi’s Sister", "Zoë Müller", "Dr. Sam"]
)
def test_real_names_are_accepted(name):
    db = FakeDb()
    assert send(db, {**VALID, "buyer_name": name}).status_code == 201
    assert db.saved


@pytest.mark.parametrize("phone", ["082 123 4567", "0821234567", "+27 82 123 4567", "(082) 123-4567"])
def test_every_way_of_writing_a_number_is_stored_the_same(phone):
    db = FakeDb()
    assert send(db, {**VALID, "buyer_contact": phone}).status_code == 201
    assert db.saved[-1].buyer_contact == "+27821234567"


def test_extra_spaces_in_a_name_are_tidied():
    db = FakeDb()
    assert send(db, {**VALID, "buyer_name": "  Sam    Smith "}).status_code == 201
    assert db.saved[-1].buyer_name == "Sam Smith"


@pytest.mark.parametrize("field", ["buyer_name", "buyer_email", "buyer_contact"])
def test_missing_field_is_refused(field):
    body = {key: value for key, value in VALID.items() if key != field}
    assert send(FakeDb(), body).status_code == 422


def test_signed_in_sender_is_recorded():
    db = FakeDb()
    token = create_access_token({"sub": "7"})
    assert send(db, headers={"Authorization": f"Bearer {token}"}).status_code == 201
    assert db.saved[0].buyer_id == 7


def test_bad_token_is_treated_as_a_guest():
    db = FakeDb()
    assert send(db, headers={"Authorization": "Bearer nonsense"}).status_code == 201
    assert db.saved[0].buyer_id is None


def test_too_many_enquiries_are_refused():
    for _ in range(inquiries.MAX_ENQUIRIES_PER_WINDOW):
        assert send(FakeDb()).status_code == 201
    db = FakeDb()
    assert send(db).status_code == 429
    assert db.saved == []
