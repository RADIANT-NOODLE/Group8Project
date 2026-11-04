"""join the complaint denial and notification migration branches

Both branches started from f6b1d4c8e0a3. This changes nothing in the database;
it gives Alembic a single head again.
"""
from typing import Sequence, Union


revision: str = 'c1d7e3a9f5b2'
down_revision: Union[str, Sequence[str], None] = ('a7c2e5f9b1d4', 'b8d3f0a2c5e9')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
