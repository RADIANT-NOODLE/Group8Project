"""add_ai_analytics_table

Revision ID: b8d3f0a2c5e9
Revises: a7c2e9f1b4d8
Create Date: 2026-11-04 23:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "b8d3f0a2c5e9"
down_revision = "a7c2e9f1b4d8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ai_analytics",
        sa.Column("analytics_id", sa.Integer(), primary_key=True, index=True),
        sa.Column(
            "property_id",
            sa.Integer(),
            sa.ForeignKey("properties.unit_id", ondelete="SET NULL"),
            nullable=False,
        ),
        sa.Column("predicted_market_value", sa.Numeric(12, 2), nullable=True),
        sa.Column("rental_yield_pct", sa.Numeric(5, 2), nullable=True),
        sa.Column("ten_year_roi", sa.Numeric(8, 2), nullable=True),
        sa.Column(
            "calculated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
        ),
        sa.Column("model_version", sa.String(20), nullable=True),
        sa.Column("confidence_score", sa.Numeric(5, 2), nullable=True),
        sa.Column("actual_market_value", sa.Numeric(12, 2), nullable=True),
        sa.Column("inference_time_ms", sa.Integer(), nullable=True),
        sa.Column("input_features_used", sa.Text(), nullable=True),
        sa.Column("is_validated", sa.Boolean(), server_default="false"),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
        ),
    )


def downgrade() -> None:
    op.drop_table("ai_analytics")
