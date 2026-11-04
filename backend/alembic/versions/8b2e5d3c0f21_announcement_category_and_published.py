"""announcements: category and published flag

Lets the HOA keep drafts and group announcements, which the Community
Announcements screen already offered.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '8b2e5d3c0f21'
down_revision: Union[str, Sequence[str], None] = '7a1d4c2b9e10'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'announcements',
        sa.Column('category', sa.String(length=50), nullable=False, server_default='General'),
    )
    op.add_column(
        'announcements',
        sa.Column('is_published', sa.Boolean(), nullable=False, server_default=sa.true()),
    )


def downgrade() -> None:
    op.drop_column('announcements', 'is_published')
    op.drop_column('announcements', 'category')
