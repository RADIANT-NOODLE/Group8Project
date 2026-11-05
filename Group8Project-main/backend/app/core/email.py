"""Outgoing e-mail. Only used for password reset links.

If SMTP_HOST is not configured nothing is sent; the link is written to the
server log instead so the flow can still be exercised in development.
"""
import asyncio
import logging
import smtplib
import ssl
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _send_sync(to_address: str, subject: str, body: str) -> None:
    settings = get_settings()
    message = EmailMessage()
    message["From"] = settings.SMTP_FROM
    message["To"] = to_address
    message["Subject"] = subject
    message.set_content(body)

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as smtp:
        if settings.SMTP_USE_TLS:
            # the default here doesn't check who the server is, which would expose the password
            smtp.starttls(context=ssl.create_default_context())
        if settings.SMTP_USER:
            smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        smtp.send_message(message)


async def send_password_reset_email(to_address: str, reset_link: str) -> bool:
    """Send the reset link. Returns True when an e-mail was actually sent."""
    settings = get_settings()
    subject = "Reset your VALORA password"
    body = (
        "We received a request to reset the password for your VALORA account.\n\n"
        f"Open this link to choose a new password (valid for {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes):\n"
        f"{reset_link}\n\n"
        "If you did not ask for this, you can ignore this e-mail - your password will not change."
    )

    if not settings.SMTP_HOST:
        logger.warning("SMTP is not configured; password reset link for %s: %s", to_address, reset_link)
        return False

    try:
        await asyncio.to_thread(_send_sync, to_address, subject, body)
        return True
    except Exception:  # never let a mail failure reveal whether the account exists
        logger.exception("Could not send password reset e-mail to %s", to_address)
        return False
