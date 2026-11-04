"""add_notifications_and_preferences

Revision ID: a7c2e9f1b4d8
Revises: f6b1d4c8e0a3
Create Date: 2026-11-04 23:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "a7c2e9f1b4d8"
down_revision = "f6b1d4c8e0a3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Notification inbox table
    op.create_table(
        "notifications",
        sa.Column("notification_id", sa.Integer(), primary_key=True, index=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.user_id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("category", sa.String(40), nullable=False, server_default="system"),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("entity_type", sa.String(40), nullable=True),
        sa.Column("entity_id", sa.Integer(), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("read_at", sa.TIMESTAMP(timezone=True), nullable=True),
    )

    # Per-user notification preferences
    op.create_table(
        "notification_preferences",
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.user_id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("inbox_enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("email_enabled", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("complaints", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("work_orders", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("announcements", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("approvals", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
        ),
    )


def downgrade() -> None:
    op.drop_table("notification_preferences")
    op.drop_table("notifications")
