"""create daily_analytics table

Revision ID: 20251224_create_daily_analytics
Revises: 20251224_create_student_progress
Create Date: 2025-12-24

"""
from alembic import op
import sqlalchemy as sa

revision = '20251224_create_daily_analytics'
down_revision = '20251224_create_student_progress'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'daily_analytics',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('student_id', sa.Integer, sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False),
        sa.Column('analytics_date', sa.Date, nullable=False),
        sa.Column('questions_answered', sa.Integer, server_default='0', nullable=False),
        sa.Column('questions_correct', sa.Integer, server_default='0', nullable=False),
        sa.Column('xp_earned', sa.Integer, server_default='0', nullable=False),
        sa.Column('time_spent_minutes', sa.Integer, server_default='0', nullable=False),
        sa.Column('streak_count', sa.Integer, server_default='0', nullable=False),
        sa.UniqueConstraint('student_id', 'analytics_date', name='uq_student_analytics_date'),
    )
    op.create_index('idx_daily_analytics_student', 'daily_analytics', ['student_id'])
    op.create_index('idx_daily_analytics_date', 'daily_analytics', ['analytics_date'])

def downgrade():
    op.drop_index('idx_daily_analytics_date', table_name='daily_analytics')
    op.drop_index('idx_daily_analytics_student', table_name='daily_analytics')
    op.drop_table('daily_analytics')
