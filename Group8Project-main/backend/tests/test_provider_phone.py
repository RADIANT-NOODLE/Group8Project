"""A service provider's phone number: exactly 10 digits, starting with 0."""
import pytest
from pydantic import ValidationError

from app.providers.schemas.service_provider import ServiceProviderCreate, ServiceProviderUpdate


def provider(phone):
    return ServiceProviderCreate(full_name="Fixit", trade="Plumbing", phone=phone, email="fixit@example.com")


BAD = ["082123456", "08212345678", "082 123 4567", "+27821234567", "082123456a", "1821234567", "0021234567", "٠٨٢١٢٣٤٥٦٧"]


def test_ten_digits_are_accepted():
    assert provider("0821234567").phone == "0821234567"
    assert ServiceProviderUpdate(phone=" 0821234567 ").phone == "0821234567"


@pytest.mark.parametrize("phone", BAD)
def test_adding_refuses_anything_else(phone):
    with pytest.raises(ValidationError):
        provider(phone)


@pytest.mark.parametrize("phone", BAD)
def test_editing_refuses_anything_else(phone):
    with pytest.raises(ValidationError):
        ServiceProviderUpdate(phone=phone)


def test_editing_without_touching_the_phone_is_fine():
    assert ServiceProviderUpdate(full_name="New Name").phone is None
