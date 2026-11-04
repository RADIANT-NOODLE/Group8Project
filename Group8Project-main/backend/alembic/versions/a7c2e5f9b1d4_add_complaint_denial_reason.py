"""add the reason a complaint was denied

The HOA can now deny a complaint, which replaces the old closed status, and
must say why. Existing complaints simply have no reason.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a7c2e5f9b1d4'
down_revision: Union[str, Sequence[str], None] = 'f6b1d4c8e0a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('complaints', sa.Column('denial_reason', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('complaints', 'denial_reason')
