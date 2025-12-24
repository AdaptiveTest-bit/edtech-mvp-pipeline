"""Replace questions table and change chapters.id to VARCHAR(50)

Revision ID: 20251224_replace_questions
Revises: 50ce9afc491e
Create Date: 2025-12-24 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20251224_replace_questions'
down_revision = '50ce9afc491e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # 1) Drop FKs from topics and questions to chapters (if they exist)
    for fk in inspector.get_foreign_keys('topics'):
        if fk.get('referred_table') == 'chapters' and fk.get('constrained_columns') == ['chapter_id']:
            op.drop_constraint(fk['name'], 'topics', type_='foreignkey')
    for fk in inspector.get_foreign_keys('questions'):
        if fk.get('referred_table') == 'chapters' and fk.get('constrained_columns') == ['chapter_id']:
            op.drop_constraint(fk['name'], 'questions', type_='foreignkey')

    # 2) Alter topics.chapter_id to VARCHAR(50)
    op.execute("ALTER TABLE topics ALTER COLUMN chapter_id TYPE VARCHAR(50) USING chapter_id::text")

    # 3) Alter chapters.id to VARCHAR(50)
    op.execute("ALTER TABLE chapters ALTER COLUMN id TYPE VARCHAR(50) USING id::text")

    # 4) Recreate FK from topics to chapters
    op.create_foreign_key('topics_chapter_id_fkey', 'topics', 'chapters', ['chapter_id'], ['id'], ondelete='CASCADE')

    # 5) Drop existing questions table if present (we dropped its FK above)
    if 'questions' in inspector.get_table_names():
        op.drop_table('questions')

    # 6) Create new questions table exactly as requested
    op.create_table(
        'questions',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('quiz_id', sa.String(length=255), nullable=False, unique=True),
        sa.Column('chapter_id', sa.String(length=50), nullable=False),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('options', sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('correct_answer_index', sa.Integer(), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('difficulty_level', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    )

    # Indexes and FK
    op.create_index('idx_questions_quiz_id', 'questions', ['quiz_id'], unique=False)
    op.create_index('idx_questions_chapter', 'questions', ['chapter_id'], unique=False)
    op.create_foreign_key('questions_chapter_id_fkey', 'questions', 'chapters', ['chapter_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Drop questions table
    if 'questions' in inspector.get_table_names():
        op.drop_table('questions')

    # Drop FK from topics to chapters
    for fk in inspector.get_foreign_keys('topics'):
        if fk.get('referred_table') == 'chapters' and fk.get('constrained_columns') == ['chapter_id']:
            op.drop_constraint(fk['name'], 'topics', type_='foreignkey')

    # Attempt to revert chapters.id and topics.chapter_id back to integer
    # Note: this will fail if non-numeric ids exist.
    op.execute("ALTER TABLE chapters ALTER COLUMN id TYPE INTEGER USING id::integer")
    op.execute("ALTER TABLE topics ALTER COLUMN chapter_id TYPE INTEGER USING chapter_id::integer")

    # Recreate FK from topics to chapters
    op.create_foreign_key('topics_chapter_id_fkey', 'topics', 'chapters', ['chapter_id'], ['id'], ondelete='CASCADE')
