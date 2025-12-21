
-- -------------------------------------------------------------------
-- Analytics schema: Attempts and Student Mastery
-- -------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE analytics.attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INT NOT NULL
        REFERENCES users.students(id),  -- Assumes a users.students table exists
    question_id INT NOT NULL
        REFERENCES curriculum.questions(id),
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INT,             -- Time student took to answer (seconds)
    selected_option VARCHAR(10),        -- The answer key selected by the student
    attempted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes to speed up common lookup queries by user or question
CREATE INDEX idx_attempts_user
    ON analytics.attempts(user_id);
CREATE INDEX idx_attempts_question
    ON analytics.attempts(question_id);

CREATE TABLE analytics.student_mastery (
    user_id INT NOT NULL
        REFERENCES users.students(id),
    concept_id INT NOT NULL
        REFERENCES curriculum.concepts(id),
    mastery_score FLOAT NOT NULL DEFAULT 0.0,       -- Exponential moving avg (0.0–1.0)
    leitner_box INT NOT NULL DEFAULT 1
        CHECK (leitner_box BETWEEN 1 AND 4),       -- Spaced-repetition box (1–4)
    next_review_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_practiced_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, concept_id)
);

-- Index to quickly find students whose next_review_date is due
CREATE INDEX idx_student_mastery_next_review
    ON analytics.student_mastery(next_review_date);
