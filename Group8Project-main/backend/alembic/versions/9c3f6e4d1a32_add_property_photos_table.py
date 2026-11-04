"""property photos

Photos HOA admins upload for a property.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '9c3f6e4d1a32'
down_revision: Union[str, Sequence[str], None] = '8b2e5d3c0f21'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'property_photos',
        sa.Column('photo_id', sa.Integer(), primary_key=True),
        sa.Column(
            'unit_id',
            sa.Integer(),
            sa.ForeignKey('properties.unit_id', ondelete='CASCADE'),
            nullable=False,
        ),
        sa.Column('file_name', sa.String(length=255), nullable=False, unique=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_property_photos_photo_id', 'property_photos', ['photo_id'])
    op.create_index('ix_property_photos_unit_id', 'property_photos', ['unit_id'])


def downgrade() -> None:
    op.drop_index('ix_property_photos_unit_id', table_name='property_photos')
    op.drop_index('ix_property_photos_photo_id', table_name='property_photos')
    op.drop_table('property_photos')
