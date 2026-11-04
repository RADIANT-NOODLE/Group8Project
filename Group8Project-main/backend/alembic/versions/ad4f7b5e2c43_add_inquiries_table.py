"""inquiries table

Buyer/investor inquiries sent to the estate agent responsible for a property.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'ad4f7b5e2c43'
down_revision: Union[str, Sequence[str], None] = '9c3f6e4d1a32'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'inquiries',
        sa.Column('inquiry_id', sa.Integer(), primary_key=True),
        sa.Column('property_id', sa.Integer(), sa.ForeignKey('properties.unit_id'), nullable=False),
        sa.Column('agent_id', sa.Integer(), sa.ForeignKey('users.user_id'), nullable=False),
        sa.Column('buyer_id', sa.Integer(), sa.ForeignKey('users.user_id'), nullable=True),
        sa.Column('buyer_name', sa.String(length=100), nullable=False),
        sa.Column('buyer_email', sa.String(length=255), nullable=False),
        sa.Column('buyer_contact', sa.String(length=50), nullable=True),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
    )
    op.create_index('ix_inquiries_inquiry_id', 'inquiries', ['inquiry_id'])
    op.create_index('ix_inquiries_agent_id', 'inquiries', ['agent_id'])


def downgrade() -> None:
    op.drop_index('ix_inquiries_agent_id', table_name='inquiries')
    op.drop_index('ix_inquiries_inquiry_id', table_name='inquiries')
    op.drop_table('inquiries')
