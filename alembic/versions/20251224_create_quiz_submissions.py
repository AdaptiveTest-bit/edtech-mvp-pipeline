"""Create quiz_submissions table

Revision ID: 20251224_create_quiz_submissions
Revises: 20251224_enforce_chapters_schema
Create Date: 2025-12-24 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '20251224_create_quiz_submissions'
down_revision = '20251224_create_students_parents'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'quiz_submissions',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('student_id', sa.Integer(), sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False),
        sa.Column('question_id', sa.Integer(), sa.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('selected_answer_index', sa.Integer(), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False),
        sa.Column('xp_earned', sa.Integer(), server_default=sa.text('0'), nullable=False),
        sa.Column('time_taken_seconds', sa.Integer(), nullable=True),
        sa.Column('submitted_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    )

    op.create_index('idx_submissions_student', 'quiz_submissions', ['student_id'], unique=False)
    op.create_index('idx_submissions_question', 'quiz_submissions', ['question_id'], unique=False)
    op.create_index('idx_submissions_timestamp', 'quiz_submissions', ['submitted_at'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_submissions_timestamp', table_name='quiz_submissions')
    op.drop_index('idx_submissions_question', table_name='quiz_submissions')
    op.drop_index('idx_submissions_student', table_name='quiz_submissions')
    op.drop_table('quiz_submissions')
