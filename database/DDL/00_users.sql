-- -------------------------------------------------------------------
-- Users schema: Students and Parents (must run FIRST - before 02_analytics.sql)
-- -------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS users;

-- -------------------------------------------------------------------
-- Students table
-- -------------------------------------------------------------------
CREATE TABLE users.students (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,          -- Auth provider ID
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    grade_level INT,
    total_xp INT DEFAULT 0,                        -- Cumulative XP
    current_streak INT DEFAULT 0,                  -- Current streak
    best_streak INT DEFAULT 0,                     -- Best streak ever
    avatar_url VARCHAR(500),                       -- Student's avatar
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_students_user_id ON users.students(user_id);
CREATE INDEX idx_students_email ON users.students(email);
CREATE INDEX idx_students_created_at ON users.students(created_at DESC);

-- -------------------------------------------------------------------
-- Parents table
-- -------------------------------------------------------------------
CREATE TABLE users.parents (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,          -- Auth provider ID
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_parents_user_id ON users.parents(user_id);
CREATE INDEX idx_parents_email ON users.parents(email);

-- -------------------------------------------------------------------
-- Student-Parent Link (Many-to-Many)
-- A student can have multiple parents (e.g., Mom and Dad)
-- A parent can monitor multiple students
-- -------------------------------------------------------------------
CREATE TABLE users.student_parent_link (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL
        REFERENCES users.students(id) ON DELETE CASCADE,
    parent_id INT NOT NULL
        REFERENCES users.parents(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, parent_id)  -- Prevent duplicate links
);

CREATE INDEX idx_student_parent_student ON users.student_parent_link(student_id);
CREATE INDEX idx_student_parent_parent ON users.student_parent_link(parent_id);

-- -------------------------------------------------------------------
-- Comments explaining the design
-- -------------------------------------------------------------------
COMMENT ON TABLE users.students IS 'Stores student account information, XP, and streaks';
COMMENT ON TABLE users.parents IS 'Stores parent/guardian account information';
COMMENT ON TABLE users.student_parent_link IS 'Links students to their parents (many-to-many relationship)';
COMMENT ON COLUMN users.students.total_xp IS 'Cumulative experience points across all chapters';
COMMENT ON COLUMN users.students.current_streak IS 'Days in a row student has completed at least one quiz';
COMMENT ON COLUMN users.students.best_streak IS 'Maximum streak ever achieved by the student';
