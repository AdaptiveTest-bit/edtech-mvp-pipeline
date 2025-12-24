"""Create students and parents tables

Revision ID: 20251224_create_students_parents
Revises: 20251224_enforce_chapters_schema
Create Date: 2025-12-24 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '20251224_create_students_parents'
down_revision = '20251224_enforce_chapters_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'students',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('first_name', sa.String(length=255), nullable=False),
        sa.Column('last_name', sa.String(length=255), nullable=False),
        sa.Column('age', sa.Integer(), nullable=False),
        sa.Column('phone', sa.String(length=15), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('gender', sa.String(length=10), nullable=True),
        sa.Column('standard', sa.String(length=20), nullable=True),
        sa.Column('enrollment_date', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
    )

    op.create_table(
        'parents',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(length=100), nullable=True),
        sa.Column('phone', sa.String(length=15), nullable=True),
        sa.Column('email', sa.String(length=100), nullable=True),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], name='parents_student_id_fkey', ondelete='CASCADE'),
        sa.UniqueConstraint('student_id', name='uq_parents_student_id'),
    )


def downgrade() -> None:
    op.drop_table('parents')
    op.drop_table('students')
