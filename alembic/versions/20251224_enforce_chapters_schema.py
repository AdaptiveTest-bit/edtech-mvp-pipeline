"""Enforce exact chapters schema

Revision ID: 20251224_enforce_chapters_schema
Revises: 20251224_replace_questions
Create Date: 2025-12-24 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '20251224_enforce_chapters_schema'
down_revision = '20251224_replace_questions'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    existing_cols = {c['name'] for c in inspector.get_columns('chapters')}

    # Rename sequence_order -> order if present
    if 'sequence_order' in existing_cols and 'order' not in existing_cols:
        op.execute('ALTER TABLE chapters RENAME COLUMN sequence_order TO "order"')
        existing_cols.remove('sequence_order')
        existing_cols.add('order')

    # Drop unit_tag if present
    if 'unit_tag' in existing_cols:
        op.drop_column('chapters', 'unit_tag')
        existing_cols.remove('unit_tag')

    # Add description
    if 'description' not in existing_cols:
        op.add_column('chapters', sa.Column('description', sa.Text(), nullable=True))

    # Add subject (safe add: add with default then make NOT NULL)
    if 'subject' not in existing_cols:
        op.add_column('chapters', sa.Column('subject', sa.String(length=100), nullable=True, server_default='general'))
        op.alter_column('chapters', 'subject', nullable=False)
        op.alter_column('chapters', 'subject', server_default=None)

    # Ensure order exists
    if 'order' not in existing_cols:
        op.add_column('chapters', sa.Column('order', sa.Integer(), nullable=True))

    # is_locked
    if 'is_locked' not in existing_cols:
        op.add_column('chapters', sa.Column('is_locked', sa.Boolean(), server_default=sa.text('TRUE'), nullable=False))

    # unlock_xp_required
    if 'unlock_xp_required' not in existing_cols:
        op.add_column('chapters', sa.Column('unlock_xp_required', sa.Integer(), server_default=sa.text('0'), nullable=False))

    # created_at
    if 'created_at' not in existing_cols:
        op.add_column('chapters', sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False))

    # Remove any columns not in desired set (safe-known extras only)
    for col in ['sequence_order', 'unit_tag']:
        if col in existing_cols:
            op.drop_column('chapters', col)

    # Create index on subject if missing
    existing_indexes = {ix['name'] for ix in inspector.get_indexes('chapters')}
    if 'idx_chapters_subject' not in existing_indexes:
        op.create_index('idx_chapters_subject', 'chapters', ['subject'], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_cols = {c['name'] for c in inspector.get_columns('chapters')}

    # Drop index
    existing_indexes = {ix['name'] for ix in inspector.get_indexes('chapters')}
    if 'idx_chapters_subject' in existing_indexes:
        op.drop_index('idx_chapters_subject', table_name='chapters')

    # Drop columns we added
    for col in ['description', 'subject', 'is_locked', 'unlock_xp_required', 'created_at', 'order']:
        if col in existing_cols:
            op.drop_column('chapters', col)

    # Recreate unit_tag if needed (as nullable text)
    if 'unit_tag' not in existing_cols:
        op.add_column('chapters', sa.Column('unit_tag', sa.String(length=50), nullable=True))
