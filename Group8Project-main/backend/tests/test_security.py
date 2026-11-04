"""Pure unit tests for the password policy and LIKE escaping (no database)."""
import pytest

from app.common.validators import (
    escape_like,
    password_problems,
    reject_control_characters,
    validate_password_strength,
)


@pytest.mark.parametrize(
    "password",
    ["Str0ng!Pass", "Aa1!aaaa", "C0mplex#Passw0rd"],
)
def test_strong_passwords_pass(password):
    assert password_problems(password) == []
    assert validate_password_strength(password) == password


@pytest.mark.parametrize(
    "password",
    ["Sh0rt!A", "alllowercase1!", "ALLUPPERCASE1!", "NoDigits!!", "NoSpecial123", "Has Space1!"],
)
def test_weak_passwords_fail(password):
    assert password_problems(password)
    with pytest.raises(ValueError):
        validate_password_strength(password)


def test_password_over_bcrypt_limit_rejected():
    assert password_problems("Aa1!" + "a" * 80)


def test_escape_like_neutralises_wildcards():
    assert escape_like("100%_sure\\") == "100\\%\\_sure\\\\"


def test_control_characters_rejected():
    with pytest.raises(ValueError):
        reject_control_characters("hello\x00world")


def test_privileged_roles_cannot_self_register():
    pytest.importorskip("email_validator")
    from pydantic import ValidationError

    from app.identity.schemas.auth import RegisterRequest

    base = dict(
        full_name="Test User", email="t@example.com", password="Str0ng!Pass", phoneno="082 123 4567"
    )
    assert RegisterRequest(**base, role="resident").role.value == "resident"
    for role in ("estate_agent", "hoa_admin", "head_admin"):
        with pytest.raises(ValidationError):
            RegisterRequest(**base, role=role)


@pytest.mark.parametrize(
    ("phone", "stored"),
    [
        ("+27 82 123 4567", "+27821234567"),
        ("0821234567", "+27821234567"),
        ("(011) 555-1234", "+27115551234"),
        (None, None),
        ("", None),
    ],
)
def test_valid_phone_numbers(phone, stored):
    from app.common.validators import validate_phone

    assert validate_phone(phone) == stored


@pytest.mark.parametrize(
    "phone",
    ["abc", "12", "082<script>", "++27821234567", "+1 202 555 0143", "08212345678", "0021234567"],
)
def test_invalid_phone_numbers(phone):
    from app.common.validators import validate_phone

    with pytest.raises(ValueError):
        validate_phone(phone)


def test_registration_requires_a_south_african_phone():
    pytest.importorskip("email_validator")
    from pydantic import ValidationError

    from app.identity.schemas.auth import RegisterRequest

    base = dict(full_name="Test User", email="t@example.com", password="Str0ng!Pass")
    for phone in (None, "", "+1 202 555 0143"):
        with pytest.raises(ValidationError):
            RegisterRequest(**base, phoneno=phone)
    assert RegisterRequest(**base, phoneno="082 123 4567").phoneno == "+27821234567"
