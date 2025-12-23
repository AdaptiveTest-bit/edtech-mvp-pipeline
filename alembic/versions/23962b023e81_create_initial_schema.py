"""create initial schema
Revision ID: 23962b023e81
Revises: 
Create Date: 2025-12-23 19:37:45.320767

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '23962b023e81'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create tables in dependency order: chapters -> topics -> concepts -> questions
    op.create_table('chapters',
        sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('chapters_id_seq'::regclass)"), autoincrement=True, nullable=False),
        sa.Column('name', sa.VARCHAR(length=255), autoincrement=False, nullable=False),
        sa.Column('sequence_order', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('unit_tag', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
        sa.PrimaryKeyConstraint('id', name='chapters_pkey'),
        postgresql_ignore_search_path=False
    )
    with op.batch_alter_table('chapters', schema=None) as batch_op:
        batch_op.create_index('ix_chapters_id', ['id'], unique=False)

    op.create_table('topics',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('chapter_id', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('name', sa.VARCHAR(length=255), autoincrement=False, nullable=False),
        sa.Column('description', sa.TEXT(), autoincrement=False, nullable=True),
        sa.ForeignKeyConstraint(['chapter_id'], ['chapters.id'], name='topics_chapter_id_fkey', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name='topics_pkey')
    )
    with op.batch_alter_table('topics', schema=None) as batch_op:
        batch_op.create_index('ix_topics_id', ['id'], unique=False)

    op.create_table('concepts',
        sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('concepts_id_seq'::regclass)"), autoincrement=True, nullable=False),
        sa.Column('topic_id', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('name', sa.VARCHAR(length=255), autoincrement=False, nullable=False),
        sa.Column('misconception_guide', sa.TEXT(), autoincrement=False, nullable=True),
        sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], name='concepts_topic_id_fkey', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name='concepts_pkey'),
        postgresql_ignore_search_path=False
    )
    with op.batch_alter_table('concepts', schema=None) as batch_op:
        batch_op.create_index('ix_concepts_id', ['id'], unique=False)

    op.create_table('questions',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('concept_id', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('content', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=False),
        sa.Column('difficulty_level', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('correct_option_key', sa.VARCHAR(length=10), autoincrement=False, nullable=False),
        sa.Column('explanation', sa.TEXT(), autoincrement=False, nullable=False),
        sa.CheckConstraint('difficulty_level >= 1 AND difficulty_level <= 3', name='questions_difficulty_level_check'),
        sa.ForeignKeyConstraint(['concept_id'], ['concepts.id'], name='questions_concept_id_fkey', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name='questions_pkey')
    )
    with op.batch_alter_table('questions', schema=None) as batch_op:
        batch_op.create_index('ix_questions_id', ['id'], unique=False)
        batch_op.create_index('idx_questions_concept_diff', ['concept_id', 'difficulty_level'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse dependency order: questions -> concepts -> topics -> chapters
    op.drop_table('questions')
    op.drop_table('concepts')
    op.drop_table('topics')
    op.drop_table('chapters')
