-- -------------------------------------------------------------------
-- Student Progress schema: Mastery tracking by chapter/concept
-- -------------------------------------------------------------------

CREATE TABLE analytics.student_progress (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL
        REFERENCES users.students(id) ON DELETE CASCADE,
    chapter_id INT NOT NULL
        REFERENCES curriculum.chapters(id) ON DELETE CASCADE,
    mastery_score NUMERIC(5,2) DEFAULT 0,        -- 0-100 percentage
    questions_completed INT DEFAULT 0,            -- Total questions answered in this chapter
    questions_correct INT DEFAULT 0,              -- Questions answered correctly
    last_answered_at TIMESTAMP,                   -- Last time student attempted a question
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, chapter_id)                   -- One row per student per chapter
);

-- Indexes for fast lookups
CREATE INDEX idx_student_progress_user ON analytics.student_progress(user_id);
CREATE INDEX idx_student_progress_chapter ON analytics.student_progress(chapter_id);
CREATE INDEX idx_student_progress_mastery ON analytics.student_progress(mastery_score DESC);

-- -------------------------------------------------------------------
-- Daily Analytics: Summary of student activity per day
-- -------------------------------------------------------------------
CREATE TABLE analytics.daily_analytics (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL
        REFERENCES users.students(id) ON DELETE CASCADE,
    analytics_date DATE NOT NULL,
    questions_answered INT DEFAULT 0,            -- Questions attempted today
    questions_correct INT DEFAULT 0,             -- Questions correct today
    xp_earned INT DEFAULT 0,                     -- XP earned today
    time_spent_minutes INT DEFAULT 0,            -- Total time spent on quizzes today
    streak_count INT DEFAULT 0,                  -- Streak count as of this date
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, analytics_date)              -- One row per student per day
);

-- Indexes for fast lookups
CREATE INDEX idx_daily_analytics_user ON analytics.daily_analytics(user_id);
CREATE INDEX idx_daily_analytics_date ON analytics.daily_analytics(analytics_date DESC);
CREATE INDEX idx_daily_analytics_user_date ON analytics.daily_analytics(user_id, analytics_date DESC);

COMMENT ON TABLE analytics.student_progress IS 'Tracks mastery score and completion for each student in each chapter';
COMMENT ON TABLE analytics.daily_analytics IS 'Daily summary of student activity for analytics dashboard';
COMMENT ON COLUMN analytics.student_progress.mastery_score IS 'Percentage (0-100) of questions correct in this chapter';
COMMENT ON COLUMN analytics.student_progress.questions_completed IS 'Total questions attempted in this chapter';
COMMENT ON COLUMN analytics.daily_analytics.streak_count IS 'Current streak count as of this date';
