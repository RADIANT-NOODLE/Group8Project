"""The Create Agent phone number: exactly 10 digits, or left empty."""
import pytest
from pydantic import ValidationError

from app.identity.schemas.auth import CreateEstateAgentRequest


def agent(phoneno):
    return CreateEstateAgentRequest(
        full_name="Nia Agent", email="nia@example.com", password="Correct@Horse1", phoneno=phoneno
    )


def test_ten_digits_are_accepted_and_stored_in_the_usual_form():
    assert agent("0821234567").phoneno == "+27821234567"


@pytest.mark.parametrize("empty", [None, "", "   "])
def test_the_number_stays_optional(empty):
    assert agent(empty).phoneno is None


@pytest.mark.parametrize(
    "phone",
    ["082123456", "08212345678", "082 123 4567", "+27821234567", "082123456a", "1821234567", "0021234567", "٠٨٢١٢٣٤٥٦٧"],
)
def test_anything_else_is_refused(phone):
    with pytest.raises(ValidationError):
        agent(phone)
