import re

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

# --- Password policy -----------------------------------------------------
PASSWORD_MIN_LENGTH = 8
# bcrypt only looks at the first 72 bytes, so longer passwords are rejected
# instead of being silently truncated.
PASSWORD_MAX_BYTES = 72
PASSWORD_SPECIAL_CHARACTERS = r"""!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"""

PASSWORD_REQUIREMENTS_TEXT = (
    f"Password must be at least {PASSWORD_MIN_LENGTH} characters and include an "
    "uppercase letter, a lowercase letter, a number and a special character."
)


def is_valid_email(value: str) -> bool:
    return bool(EMAIL_REGEX.match(value))


def normalise_email(value: str) -> str:
    return value.strip().lower()


def password_problems(password: str) -> list[str]:
    """Return a human-readable list of every rule the password breaks."""
    problems: list[str] = []
    if len(password) < PASSWORD_MIN_LENGTH:
        problems.append(f"be at least {PASSWORD_MIN_LENGTH} characters long")
    if len(password.encode("utf-8")) > PASSWORD_MAX_BYTES:
        problems.append(f"be no longer than {PASSWORD_MAX_BYTES} bytes")
    if not re.search(r"[a-z]", password):
        problems.append("contain a lowercase letter")
    if not re.search(r"[A-Z]", password):
        problems.append("contain an uppercase letter")
    if not re.search(r"\d", password):
        problems.append("contain a number")
    if not any(ch in PASSWORD_SPECIAL_CHARACTERS for ch in password):
        problems.append("contain a special character")
    if re.search(r"\s", password):
        problems.append("not contain spaces")
    return problems


def validate_password_strength(password: str) -> str:
    """Raise ValueError (so Pydantic reports a 422) when the password is too weak."""
    problems = password_problems(password)
    if problems:
        raise ValueError("Password must " + ", ".join(problems) + ".")
    return password


# --- Input hygiene (defence in depth for SQL-injection style input) -------
# All database access goes through SQLAlchemy bound parameters, which is what
# actually prevents SQL injection. These helpers add a second layer: wildcard
# characters supplied by a user can no longer widen a LIKE search, and NUL /
# control characters (which PostgreSQL rejects and which are never legitimate
# in a name, address or message) are refused before they reach the database.

_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def escape_like(value: str, escape: str = "\\") -> str:
    """Escape %, _ and the escape character so user text is matched literally."""
    return (
        value.replace(escape, escape + escape)
        .replace("%", escape + "%")
        .replace("_", escape + "_")
    )


def reject_control_characters(value: str | None) -> str | None:
    """Raise ValueError if text contains NUL or other control characters."""
    if value is not None and _CONTROL_CHARS.search(value):
        raise ValueError("Text contains characters that are not allowed.")
    return value


_PHONE_PATTERN = re.compile(r"^[+(]?[0-9][0-9 ()\-]{5,18}[0-9]$")


def validate_phone(value: str | None) -> str | None:
    """Optional phone number: digits with an optional leading +, spaces, dashes, brackets."""
    if value is None:
        return None
    value = value.strip()
    if not value:
        return None
    if not _PHONE_PATTERN.match(value):
        raise ValueError("Enter a valid phone number, for example +27 82 123 4567.")
    return value
