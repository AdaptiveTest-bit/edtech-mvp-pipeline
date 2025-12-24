-- Performance Indexes for EdTech MVP
-- Run AFTER all other DDL files (00-04)

-- ============================================================
-- USERS SCHEMA INDEXES
-- ============================================================

-- Students table indexes
CREATE INDEX IF NOT EXISTS idx_students_email 
    ON users.students(email);

CREATE INDEX IF NOT EXISTS idx_students_created_at 
    ON users.students(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_students_total_xp 
    ON users.students(total_xp DESC);

-- Parents table indexes
CREATE INDEX IF NOT EXISTS idx_parents_email 
    ON users.parents(email);

-- Student-Parent link indexes
CREATE INDEX IF NOT EXISTS idx_student_parent_student_id 
    ON users.student_parent_link(student_id);

CREATE INDEX IF NOT EXISTS idx_student_parent_parent_id 
    ON users.student_parent_link(parent_id);

-- ============================================================
-- CURRICULUM SCHEMA INDEXES
-- ============================================================

-- Chapters indexes
CREATE INDEX IF NOT EXISTS idx_chapters_subject 
    ON curriculum.chapters(subject);

-- Topics indexes
CREATE INDEX IF NOT EXISTS idx_topics_chapter_id 
    ON curriculum.topics(chapter_id);

-- Concepts indexes
CREATE INDEX IF NOT EXISTS idx_concepts_topic_id 
    ON curriculum.concepts(topic_id);

CREATE INDEX IF NOT EXISTS idx_concepts_difficulty 
    ON curriculum.concepts(difficulty_level);

-- Questions indexes
CREATE INDEX IF NOT EXISTS idx_questions_concept_id 
    ON curriculum.questions(concept_id);

CREATE INDEX IF NOT EXISTS idx_questions_difficulty 
    ON curriculum.questions(difficulty_level);

-- ============================================================
-- ANALYTICS SCHEMA INDEXES
-- ============================================================

-- Attempts table - Critical for performance
CREATE INDEX IF NOT EXISTS idx_attempts_user_id 
    ON analytics.attempts(user_id);

CREATE INDEX IF NOT EXISTS idx_attempts_question_id 
    ON analytics.attempts(question_id);

CREATE INDEX IF NOT EXISTS idx_attempts_user_date 
    ON analytics.attempts(user_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_attempts_is_correct 
    ON analytics.attempts(is_correct);

-- Student mastery table - For spaced repetition
CREATE INDEX IF NOT EXISTS idx_student_mastery_user_id 
    ON analytics.student_mastery(user_id);

CREATE INDEX IF NOT EXISTS idx_student_mastery_concept_id 
    ON analytics.student_mastery(concept_id);

CREATE INDEX IF NOT EXISTS idx_student_mastery_next_review 
    ON analytics.student_mastery(next_review_date) 
    WHERE leitner_box < 4;

CREATE INDEX IF NOT EXISTS idx_student_mastery_user_concept 
    ON analytics.student_mastery(user_id, concept_id);

-- Quiz submissions table
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_user_id 
    ON analytics.quiz_submissions(user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_question_id 
    ON analytics.quiz_submissions(question_id);

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_user_date 
    ON analytics.quiz_submissions(user_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_is_correct 
    ON analytics.quiz_submissions(is_correct);

-- Student progress table
CREATE INDEX IF NOT EXISTS idx_student_progress_user_id 
    ON analytics.student_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_student_progress_chapter_id 
    ON analytics.student_progress(chapter_id);

CREATE INDEX IF NOT EXISTS idx_student_progress_mastery 
    ON analytics.student_progress(mastery_score DESC);

CREATE INDEX IF NOT EXISTS idx_student_progress_user_chapter 
    ON analytics.student_progress(user_id, chapter_id);

-- Daily analytics table
CREATE INDEX IF NOT EXISTS idx_daily_analytics_user_id 
    ON analytics.daily_analytics(user_id);

CREATE INDEX IF NOT EXISTS idx_daily_analytics_date 
    ON analytics.daily_analytics(activity_date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_analytics_user_date 
    ON analytics.daily_analytics(user_id, activity_date DESC);

-- ============================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================

-- For finding next questions to review (Leitner system)
CREATE INDEX IF NOT EXISTS idx_mastery_review_queue 
    ON analytics.student_mastery(user_id, next_review_date, leitner_box)
    WHERE next_review_date <= CURRENT_DATE;

-- For daily analytics aggregation
CREATE INDEX IF NOT EXISTS idx_attempts_daily_stats 
    ON analytics.attempts(user_id, DATE(submitted_at), is_correct);

-- For leaderboard queries
CREATE INDEX IF NOT EXISTS idx_students_leaderboard 
    ON users.students(total_xp DESC, current_streak DESC, updated_at DESC);

-- For chapter mastery aggregation
CREATE INDEX IF NOT EXISTS idx_progress_chapter_stats 
    ON analytics.student_progress(chapter_id, mastery_score DESC);

-- ============================================================
-- VERIFY INDEXES CREATED
-- ============================================================

-- Display all created indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname IN ('users', 'curriculum', 'analytics')
ORDER BY schemaname, tablename, indexname;
