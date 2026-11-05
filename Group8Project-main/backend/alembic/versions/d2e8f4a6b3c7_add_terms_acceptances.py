"""record who agreed to the Terms and Conditions

A separate table rather than new columns on users, so that nothing except
registration depends on it. Existing accounts simply have no record yet.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd2e8f4a6b3c7'
down_revision: Union[str, Sequence[str], None] = 'c1d7e3a9f5b2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'terms_acceptances',
        sa.Column('acceptance_id', sa.Integer(), primary_key=True),
        sa.Column(
            'user_id',
            sa.Integer(),
            sa.ForeignKey('users.user_id', ondelete='CASCADE'),
            nullable=False,
        ),
        sa.Column('terms_version', sa.String(length=20), nullable=False),
        sa.Column(
            'accepted_at',
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
    )
    op.create_index('ix_terms_acceptances_acceptance_id', 'terms_acceptances', ['acceptance_id'])
    op.create_index('ix_terms_acceptances_user_id', 'terms_acceptances', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_terms_acceptances_user_id', table_name='terms_acceptances')
    op.drop_index('ix_terms_acceptances_acceptance_id', table_name='terms_acceptances')
    op.drop_table('terms_acceptances')
