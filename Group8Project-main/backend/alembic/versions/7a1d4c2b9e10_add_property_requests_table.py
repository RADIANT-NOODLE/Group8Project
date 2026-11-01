"""add property_requests table

Sale / rent requests raised by residents and investors, reviewed by the HOA and
then handed to an estate agent.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '7a1d4c2b9e10'
down_revision: Union[str, Sequence[str], None] = '103dd39ca30e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'property_requests',
        sa.Column('request_id', sa.Integer(), nullable=False),
        sa.Column('requester_id', sa.Integer(), nullable=False),
        sa.Column('unit_id', sa.Integer(), nullable=False),
        sa.Column('request_type', sa.String(length=10), nullable=False),
        sa.Column('asking_price', sa.Numeric(12, 2), nullable=False),
        sa.Column('rental_period', sa.String(length=30), nullable=True),
        sa.Column('financial_information', sa.Text(), nullable=True),
        sa.Column('additional_details', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending_review'),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('decided_by', sa.Integer(), nullable=True),
        sa.Column('decided_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('assigned_agent_id', sa.Integer(), nullable=True),
        sa.Column('assigned_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['requester_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['unit_id'], ['properties.unit_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['decided_by'], ['users.user_id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['assigned_agent_id'], ['users.user_id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('request_id'),
    )
    op.create_index(op.f('ix_property_requests_request_id'), 'property_requests', ['request_id'], unique=False)
    op.create_index('ix_property_requests_status', 'property_requests', ['status'], unique=False)
    op.create_index('ix_property_requests_assigned_agent_id', 'property_requests', ['assigned_agent_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_property_requests_assigned_agent_id', table_name='property_requests')
    op.drop_index('ix_property_requests_status', table_name='property_requests')
    op.drop_index(op.f('ix_property_requests_request_id'), table_name='property_requests')
    op.drop_table('property_requests')
