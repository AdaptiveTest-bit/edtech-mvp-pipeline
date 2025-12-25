-- Missions system (daily tasks for engagement)
CREATE TABLE IF NOT EXISTS missions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users.students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reward_xp INTEGER DEFAULT 50,
    difficulty_level INTEGER DEFAULT 1, -- 1=easy, 2=hard
    status VARCHAR(50) DEFAULT 'active', -- active, completed, failed, expired
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for quick queries
CREATE INDEX IF NOT EXISTS idx_missions_student_id ON missions(student_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_due_date ON missions(due_date);
