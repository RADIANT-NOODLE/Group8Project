"""add listing_type to listings

Lets a public listing say whether the unit is for sale or for rent,
so the price can be shown as a price or a monthly rent.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd4f9b2a6c8e1'
down_revision: Union[str, Sequence[str], None] = 'c3e8a1f5b7d9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('listings', sa.Column('listing_type', sa.String(length=10), nullable=True))


def downgrade() -> None:
    op.drop_column('listings', 'listing_type')
