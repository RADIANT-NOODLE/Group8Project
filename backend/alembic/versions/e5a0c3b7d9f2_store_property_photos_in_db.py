"""store property photo files in the database

Photos used to be saved only on the disk of the computer that uploaded
them, so every other machine showed broken images. The image bytes now
live in the shared database next to the photo record.

Both columns are nullable: rows uploaded before this change have no data
until `python -m app.property.backfill_photos` is run on the computer
that still holds the files.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'e5a0c3b7d9f2'
down_revision: Union[str, Sequence[str], None] = 'd4f9b2a6c8e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('property_photos', sa.Column('content_type', sa.String(length=50), nullable=True))
    op.add_column('property_photos', sa.Column('data', sa.LargeBinary(), nullable=True))


def downgrade() -> None:
    op.drop_column('property_photos', 'data')
    op.drop_column('property_photos', 'content_type')
