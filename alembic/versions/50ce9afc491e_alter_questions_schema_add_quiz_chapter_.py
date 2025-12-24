"""alter questions schema add quiz/chapter/options etc
Revision ID: 50ce9afc491e
Revises: 63b8009801f8
Create Date: 2025-12-24 16:48:38.025737

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '50ce9afc491e'
down_revision = '63b8009801f8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_cols = {c['name'] for c in inspector.get_columns('questions')}
    # Add new columns only if they don't already exist
    if 'quiz_id' not in existing_cols:
        op.add_column('questions', sa.Column('quiz_id', sa.VARCHAR(length=255), nullable=True))
    if 'chapter_id' not in existing_cols:
        op.add_column('questions', sa.Column('chapter_id', sa.INTEGER(), nullable=True))
    if 'question_text' not in existing_cols:
        op.add_column('questions', sa.Column('question_text', sa.TEXT(), nullable=True))
    if 'options' not in existing_cols:
        op.add_column('questions', sa.Column('options', sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    if 'correct_answer_index' not in existing_cols:
        op.add_column('questions', sa.Column('correct_answer_index', sa.INTEGER(), nullable=True))
    if 'image_url' not in existing_cols:
        op.add_column('questions', sa.Column('image_url', sa.VARCHAR(length=500), nullable=True))
    if 'difficulty_level' not in existing_cols:
        op.add_column('questions', sa.Column('difficulty_level', sa.VARCHAR(length=20), nullable=True))
    if 'created_at' not in existing_cols:
        op.add_column('questions', sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True))

    # Create indexes if missing
    existing_indexes = {ix['name'] for ix in inspector.get_indexes('questions')}
    if 'idx_questions_quiz_id' not in existing_indexes:
        op.create_index('idx_questions_quiz_id', 'questions', ['quiz_id'], unique=False)
    if 'idx_questions_chapter' not in existing_indexes:
        op.create_index('idx_questions_chapter', 'questions', ['chapter_id'], unique=False)

    # Add foreign key constraint for chapter_id -> chapters.id if missing
    existing_fks = {fk.get('name') for fk in inspector.get_foreign_keys('questions')}
    if 'questions_chapter_id_fkey' not in existing_fks:
        op.create_foreign_key('questions_chapter_id_fkey', 'questions', 'chapters', ['chapter_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_cols = {c['name'] for c in inspector.get_columns('questions')}
    existing_indexes = {ix['name'] for ix in inspector.get_indexes('questions')}
    existing_fks = {fk.get('name') for fk in inspector.get_foreign_keys('questions')}

    # Drop foreign key if exists
    if 'questions_chapter_id_fkey' in existing_fks:
        op.drop_constraint('questions_chapter_id_fkey', 'questions', type_='foreignkey')

    # Drop indexes if exist
    if 'idx_questions_quiz_id' in existing_indexes:
        op.drop_index('idx_questions_quiz_id', table_name='questions')
    if 'idx_questions_chapter' in existing_indexes:
        op.drop_index('idx_questions_chapter', table_name='questions')

    # Drop columns if they exist
    for col in ['created_at', 'difficulty_level', 'image_url', 'correct_answer_index', 'options', 'question_text', 'chapter_id', 'quiz_id']:
        if col in existing_cols:
            op.drop_column('questions', col)
