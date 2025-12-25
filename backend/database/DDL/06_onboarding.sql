-- Onboarding tracking (backward compatible - new table only)
CREATE TABLE IF NOT EXISTS onboarding_status (
    id SERIAL PRIMARY KEY,
    student_id INTEGER UNIQUE NOT NULL REFERENCES users.students(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    avatar_selected VARCHAR(255),
    goals JSONB, -- Store as JSON: {math: true, science: false}
    baseline_score FLOAT DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_onboarding_student_id ON onboarding_status(student_id);
