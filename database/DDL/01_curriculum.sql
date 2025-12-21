-- Enable UUID generation function
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------------
-- Curriculum schema: Chapters, Topics, Concepts, Questions
-- -------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS curriculum;

CREATE TABLE curriculum.chapters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,          -- e.g. "Shapes and Angles"
    sequence_order INT NOT NULL,         -- Natural ordering of chapters
    unit_tag VARCHAR(50)                 -- e.g. 'GEOMETRY', 'NUM_SYS' (optional)
);

CREATE TABLE curriculum.topics (
    id SERIAL PRIMARY KEY,
    chapter_id INT NOT NULL
        REFERENCES curriculum.chapters(id),
    name VARCHAR(255) NOT NULL,          -- e.g. "Types of Angles"
    description TEXT                     -- Optional description of the topic
);

CREATE TABLE curriculum.concepts (
    id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL
        REFERENCES curriculum.topics(id),
    name VARCHAR(255) NOT NULL,          -- e.g. "Acute vs Obtuse Angles"
    misconception_guide TEXT             -- Advice for parents if the student fails this concept
);

CREATE TABLE curriculum.questions (
    id SERIAL PRIMARY KEY,
    concept_id INT NOT NULL
        REFERENCES curriculum.concepts(id),
    content JSONB NOT NULL,             -- Question text, images, options in JSON format
    difficulty_level INT NOT NULL
        CHECK (difficulty_level BETWEEN 1 AND 3),  -- 1=Easy, 2=Medium, 3=Hard
    correct_option_key VARCHAR(10) NOT NULL,      -- e.g. 'A', the key of the correct answer
    explanation TEXT NOT NULL           -- Explanation or solution text
);

-- Index to speed up queries filtering by concept and difficulty
CREATE INDEX idx_questions_concept_diff
    ON curriculum.questions(concept_id, difficulty_level);

