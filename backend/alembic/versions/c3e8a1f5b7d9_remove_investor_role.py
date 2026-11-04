"""remove the investor role

VALORA no longer has investors. Any existing investor accounts become
residents, so their rows still validate against UserRole.
"""
from typing import Sequence, Union

from alembic import op


revision: str = 'c3e8a1f5b7d9'
down_revision: Union[str, Sequence[str], None] = 'ad4f7b5e2c43'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("UPDATE users SET role = 'resident' WHERE role = 'investor'")


def downgrade() -> None:
    # Which residents used to be investors is not recorded, so this cannot be undone.
    pass
