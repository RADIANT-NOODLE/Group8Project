"""Names on registration: no numbers or symbols, but real names must still get through."""
import pytest
from pydantic import ValidationError

from app.identity.schemas.auth import RegisterRequest


def register(full_name):
    return RegisterRequest(
        full_name=full_name,
        email="sam@example.com",
        password="Correct@Horse1",
        phoneno="0821234567",
        terms_accepted=True,
    )


@pytest.mark.parametrize(
    "name",
    ["Sam Smith", "Mary-Jane Naidoo", "Sipho O'Brien", "Thandi van der Merwe", "José Müller", "Nomsa Dlamini-Zulu"],
)
def test_real_names_are_accepted(name):
    assert register(name).full_name == name


@pytest.mark.parametrize(
    "name",
    ["Sam@ Smith", "Sam Smith!", "S#m Smith", "Sam1 Smith", "Sam_Smith", "Sam Sm$th", "<b>Sam</b>", "-Sam Smith", "Sam Smith'", "Sam (Sammy) Smith", "12345"],
)
def test_special_characters_are_refused(name):
    with pytest.raises(ValidationError, match="only contain letters"):
        register(name)


def test_extra_spaces_are_tidied():
    assert register("  Sam   Smith ").full_name == "Sam Smith"
