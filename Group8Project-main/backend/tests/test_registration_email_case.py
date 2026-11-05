"""Registration refuses capitals after the @, and login still accepts any capitals."""
import pytest
from pydantic import ValidationError

from app.identity.schemas.auth import LoginRequest, RegisterRequest


def register(email):
    return RegisterRequest(
        full_name="Sam Smith", email=email, password="Correct@Horse1", phoneno="0821234567", terms_accepted=True
    )


@pytest.mark.parametrize("email", ["sam@GMAIL.COM", "sam@Gmail.com", "sam@gmail.Com", "sam@gmail.COM", "SAM@Gmail.com"])
def test_capitals_after_the_at_are_refused(email):
    with pytest.raises(ValidationError, match="lowercase letters after the @"):
        register(email)


@pytest.mark.parametrize("email", ["sam@gmail.com", "Sam@gmail.com", "SAM.SMITH@example.co.za"])
def test_the_rest_is_accepted(email):
    assert register(email).email == email


def test_an_existing_account_can_still_log_in_with_capitals():
    assert LoginRequest(email="sam@GMAIL.COM", password="Correct@Horse1")
