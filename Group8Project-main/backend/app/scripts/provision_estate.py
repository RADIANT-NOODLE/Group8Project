"""provision_estate.py — Bootstrap an estate with an HOA admin account.

Usage:
    python -m app.scripts.provision_estate \\
        --estate-name "Greenwood Estate" \\
        --admin-email hoa@greenwood.co.za \\
        --admin-name "John Smith"
"""
import argparse
import asyncio
import getpass
import os
import sys

from app.common.enums import UserRole
from app.common.validators import is_valid_email, normalise_email
from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.identity.repositories.user_repository import UserRepository


async def _run(estate_name: str, admin_email: str, admin_name: str, password: str) -> None:
    async with AsyncSessionLocal() as db:
        repo = UserRepository(db)
        existing = await repo.get_by_email(admin_email)

        if existing is not None:
            existing.role = UserRole.hoa_admin.value
            existing.hoa_approved = True
            await repo.save(existing)
            print(f"[{estate_name}] Promoted {admin_email} to hoa_admin.")
        else:
            await repo.create(
                full_name=admin_name,
                email=admin_email,
                password_hash=hash_password(password),
                role=UserRole.hoa_admin.value,
                hoa_approved=True,
            )
            print(f"[{estate_name}] Created hoa_admin account for {admin_email}.")

    print(f"Estate '{estate_name}' provisioned successfully.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Provision a new estate with an HOA admin")
    parser.add_argument("--estate-name", required=True, help="Name of the estate")
    parser.add_argument("--admin-email", required=True, help="Admin user email")
    parser.add_argument("--admin-name", default="HOA Administrator", help="Admin user full name")
    args = parser.parse_args()

    email = normalise_email(args.admin_email)
    if not is_valid_email(email):
        raise SystemExit("Invalid admin email address.")

    password = os.environ.get("HOA_ADMIN_PASSWORD")
    if not password and sys.stdin.isatty():
        password = getpass.getpass("Admin password (min 8 chars): ")
    if not password or len(password) < 8:
        raise SystemExit("Password must be at least 8 characters.")

    asyncio.run(_run(args.estate_name, email, args.admin_name, password))


if __name__ == "__main__":
    main()
