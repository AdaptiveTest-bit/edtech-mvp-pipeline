-- -------------------------------------------------------------------
-- Quiz Submissions schema: Student quiz attempts and answers
-- -------------------------------------------------------------------

CREATE TABLE analytics.quiz_submissions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL
        REFERENCES users.students(id) ON DELETE CASCADE,
    question_id INT NOT NULL
        REFERENCES curriculum.questions(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INT,                       -- Time student took to answer (seconds)
    selected_option VARCHAR(10),                  -- The answer key selected by the student
    xp_earned INT DEFAULT 0,                      -- XP awarded for this submission
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_quiz_submissions_user ON analytics.quiz_submissions(user_id);
CREATE INDEX idx_quiz_submissions_question ON analytics.quiz_submissions(question_id);
CREATE INDEX idx_quiz_submissions_timestamp ON analytics.quiz_submissions(submitted_at DESC);
CREATE INDEX idx_quiz_submissions_user_correct ON analytics.quiz_submissions(user_id, is_correct);

COMMENT ON TABLE analytics.quiz_submissions IS 'Stores every quiz submission by students';
COMMENT ON COLUMN analytics.quiz_submissions.is_correct IS 'Whether the student selected the correct option';
COMMENT ON COLUMN analytics.quiz_submissions.time_taken_seconds IS 'How long (in seconds) student spent on this question';
COMMENT ON COLUMN analytics.quiz_submissions.xp_earned IS 'XP awarded for this submission (10 if correct, 0 if wrong)';
