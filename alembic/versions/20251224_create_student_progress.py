"""Create student_progress table

Revision ID: 20251224_create_student_progress
Revises: 20251224_create_quiz_submissions
Create Date: 2025-12-24 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '20251224_create_student_progress'
down_revision = '20251224_create_quiz_submissions'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'student_progress',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('student_id', sa.Integer(), sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False),
        sa.Column('chapter_id', sa.String(length=50), sa.ForeignKey('chapters.id', ondelete='CASCADE'), nullable=False),
        sa.Column('mastery_score', sa.Numeric(5, 2), server_default=sa.text('0'), nullable=False),
        sa.Column('questions_completed', sa.Integer(), server_default=sa.text('0'), nullable=False),
        sa.Column('questions_correct', sa.Integer(), server_default=sa.text('0'), nullable=False),
        sa.Column('last_answered_at', sa.TIMESTAMP(), nullable=True),
        sa.UniqueConstraint('student_id', 'chapter_id', name='uq_student_chapter')
    )

    op.create_index('idx_progress_student', 'student_progress', ['student_id'], unique=False)
    op.create_index('idx_progress_chapter', 'student_progress', ['chapter_id'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_progress_chapter', table_name='student_progress')
    op.drop_index('idx_progress_student', table_name='student_progress')
    op.drop_table('student_progress')
