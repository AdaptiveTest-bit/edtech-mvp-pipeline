"""add chapter_name to chapters
Revision ID: 63b8009801f8
Revises: 23962b023e81
Create Date: 2025-12-23 21:56:36.400778

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '63b8009801f8'
down_revision = '23962b023e81'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('chapters', sa.Column('chapter_name', sa.VARCHAR(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('chapters', 'chapter_name')
