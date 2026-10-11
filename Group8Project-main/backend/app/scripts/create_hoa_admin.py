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


async def _run(email: str, full_name: str, password: str | None) -> None:
    async with AsyncSessionLocal() as db:
        repo = UserRepository(db)
        existing = await repo.get_by_email(email)

        if existing is not None:
            existing.role = UserRole.hoa_admin.value
            existing.hoa_approved = True
            await repo.save(existing)
            print(f"Promoted existing user {email} to hoa_admin.")
            return

        if not password:
            raise SystemExit("A password is required to create a new account.")
        await repo.create(
            full_name=full_name,
            email=email,
            password_hash=hash_password(password),
            role=UserRole.hoa_admin.value,
            hoa_approved=True,
        )
        print(f"Created hoa_admin account for {email}.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", default="HOA Administrator", help="Full name for a new account")
    args = parser.parse_args()

    email = normalise_email(args.email)
    if not is_valid_email(email):
        raise SystemExit("That does not look like a valid email address.")

    password = os.environ.get("HOA_ADMIN_PASSWORD")
    if not password and sys.stdin.isatty():
        password = getpass.getpass("Password (min 8 characters): ")
    if password is not None and len(password) < 8:
        raise SystemExit("Password must be at least 8 characters.")

    asyncio.run(_run(email, args.name, password))


if __name__ == "__main__":
    main()
