"""assign_platform_admin.py — Assign or create a platform (head) admin account.

Usage:
    python -m app.scripts.assign_platform_admin --email platform@valora.com --name "Platform Admin"
"""
import argparse
import asyncio
import getpass
import os
import sys

from app.common.validators import is_valid_email, normalise_email
from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.identity.repositories.user_repository import UserRepository


async def _run(email: str, full_name: str, password: str | None) -> None:
    async with AsyncSessionLocal() as db:
        repo = UserRepository(db)
        existing = await repo.get_by_email(email)

        if existing is not None:
            existing.role = "head_admin"
            existing.hoa_approved = True
            await repo.save(existing)
            print(f"Promoted {email} to head_admin (platform admin).")
            return

        if not password:
            raise SystemExit("A password is required to create a new platform admin account.")
        await repo.create(
            full_name=full_name,
            email=email,
            password_hash=hash_password(password),
            role="head_admin",
            hoa_approved=True,
        )
        print(f"Created head_admin (platform admin) account for {email}.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Assign or create a platform admin account")
    parser.add_argument("--email", required=True, help="Platform admin email")
    parser.add_argument("--name", default="Platform Administrator", help="Full name")
    args = parser.parse_args()

    email = normalise_email(args.email)
    if not is_valid_email(email):
        raise SystemExit("Invalid email address.")

    password = os.environ.get("PLATFORM_ADMIN_PASSWORD")
    if not password and sys.stdin.isatty():
        password = getpass.getpass("Password (min 8 characters): ")
    if password is not None and len(password) < 8:
        raise SystemExit("Password must be at least 8 characters.")

    asyncio.run(_run(email, args.name, password))


if __name__ == "__main__":
    main()
