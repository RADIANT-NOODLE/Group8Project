"""store complaint photos in the database

complaints.photo_url only holds 500 characters, so a photo attached to a
complaint could never be saved. The image now lives in its own table; only
the complaint's author and admins can read it.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f6b1d4c8e0a3'
down_revision: Union[str, Sequence[str], None] = 'e5a0c3b7d9f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'complaint_photos',
        sa.Column(
            'complaint_id',
            sa.Integer(),
            sa.ForeignKey('complaints.complaint_id', ondelete='CASCADE'),
            primary_key=True,
        ),
        sa.Column('content_type', sa.String(length=50), nullable=False),
        sa.Column('data', sa.LargeBinary(), nullable=False),
        sa.Column(
            'created_at',
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_table('complaint_photos')
