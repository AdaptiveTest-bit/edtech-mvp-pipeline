# 🗄️ Database Schema

Complete EdTech MVP database documentation including all tables, relationships, and sample data.

---

## Overview

**Database:** PostgreSQL 12+  
**Database Name:** `edtech_mvp`  
**Total Tables:** 12+  
**Schemas:** 3 (users, curriculum, analytics)  
**Sample Records:** 140+

---

## Schema Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      USERS SCHEMA                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  students                                                       │
│  ├── id (UUID, PK)                                              │
│  ├── email (VARCHAR, UNIQUE)                                    │
│  ├── password_hash (VARCHAR)                                    │
│  ├── first_name (VARCHAR)                                       │
│  ├── last_name (VARCHAR)                                        │
│  └── created_at (TIMESTAMP)                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   CURRICULUM SCHEMA                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  chapters                          concepts                     │
│  ├── id (INT, PK)          ├── id (INT, PK)                    │
│  ├── name (VARCHAR)        ├── chapter_id (INT, FK)            │
│  └── description (TEXT)    ├── name (VARCHAR)                  │
│                            └── description (TEXT)              │
│                                   ↓                            │
│                              questions                          │
│                              ├── id (INT, PK)                  │
│                              ├── concept_id (INT, FK)          │
│                              ├── question_text (TEXT)          │
│                              ├── option_a - d (VARCHAR)        │
│                              ├── correct_option (VARCHAR)      │
│                              ├── difficulty (INT)              │
│                              └── explanation (TEXT)            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   ANALYTICS SCHEMA                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  quiz_submissions              student_progress                │
│  ├── id (UUID, PK)        ├── id (UUID, PK)                   │
│  ├── student_id (FK) ──┐  ├── student_id (FK) ──┐            │
│  ├── question_id (FK)  │  ├── concept_id (FK)   │            │
│  ├── selected_option   │  ├── mastery_score     │            │
│  ├── is_correct        │  ├── attempts          │            │
│  └── created_at        │  ├── last_reviewed     │            │
│                        │  ├── leitner_box       │            │
│                        │  └── (updated on quiz) │            │
│                        │                        │            │
│  student_analytics ───┘                        │            │
│  ├── id (UUID, PK)                             │            │
│  ├── student_id (FK) ────────────────────────┘            │
│  ├── total_xp                                              │
│  ├── current_streak                                        │
│  ├── best_streak                                           │
│  └── last_activity                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Users Schema

### students table

Stores all student accounts.

```sql
CREATE TABLE users.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| id | UUID | PK, Default | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| first_name | VARCHAR(100) | NOT NULL | Student first name |
| last_name | VARCHAR(100) | NOT NULL | Student last name |
| created_at | TIMESTAMP | Default CURRENT_TIMESTAMP | Account creation time |

**Sample Data (5 students):**

| Email | Name | Created |
|-------|------|---------|
| alice@example.com | Alice Smith | 2024-01-01 |
| bob@example.com | Bob Johnson | 2024-01-02 |
| charlie@example.com | Charlie Brown | 2024-01-03 |
| diana@example.com | Diana Prince | 2024-01-04 |
| eve@example.com | Eve Wilson | 2024-01-05 |

All sample passwords: `password123` (hashed with bcrypt)

---

## Curriculum Schema

### chapters table

Learning chapters/modules.

```sql
CREATE TABLE curriculum.chapters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| id | SERIAL | PK | Auto-incrementing ID |
| name | VARCHAR(255) | NOT NULL | Chapter name |
| description | TEXT | NULL | Chapter description |
| created_at | TIMESTAMP | Default | Creation time |

**Sample Data (5 chapters):**

| ID | Name | Description |
|----|------|-------------|
| 1 | Programming Basics | Fundamentals of programming |
| 2 | Control Flow | If statements and loops |
| 3 | Functions & Scope | Function definition and scope |
| 4 | Data Structures | Arrays, lists, dictionaries |
| 5 | Advanced Topics | Recursion and algorithms |

---

### concepts table

Individual topics/concepts within chapters.

```sql
CREATE TABLE curriculum.concepts (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER NOT NULL REFERENCES curriculum.chapters(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| id | SERIAL | PK | Auto-incrementing ID |
| chapter_id | INTEGER | FK, NOT NULL | Parent chapter |
| name | VARCHAR(255) | NOT NULL | Concept name |
| description | TEXT | NULL | Concept description |
| created_at | TIMESTAMP | Default | Creation time |

**Sample Data (17 concepts across 5 chapters):**

| ID | Chapter | Name |
|----|---------|------|
| 1 | Basics | Variables |
| 2 | Basics | Data Types |
| 3 | Basics | Operators |
| 4 | Basics | Input/Output |
| 5 | Basics | Comments |
| 6 | Control Flow | If Statements |
| 7 | Control Flow | Loops |
| 8 | Control Flow | Break/Continue |
| 9 | Control Flow | Conditionals |
| 10 | Control Flow | Nested Logic |
| 11 | Functions | Function Definition |
| 12 | Functions | Parameters |
| 13 | Functions | Return Values |
| 14 | Functions | Scope |
| 15 | Functions | Recursion |
| 16 | Data Structures | Arrays |
| 17 | Data Structures | Lists |

---

### questions table

Quiz questions for each concept.

```sql
CREATE TABLE curriculum.questions (
  id SERIAL PRIMARY KEY,
  concept_id INTEGER NOT NULL REFERENCES curriculum.concepts(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_option VARCHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  difficulty INTEGER NOT NULL CHECK (difficulty IN (1, 2)),
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| id | SERIAL | PK | Auto-incrementing ID |
| concept_id | INTEGER | FK, NOT NULL | Parent concept |
| question_text | TEXT | NOT NULL | Question prompt |
| option_a-d | VARCHAR(255) | NOT NULL | Answer choices |
| correct_option | VARCHAR(1) | CHECK, NOT NULL | Correct answer (A/B/C/D) |
| difficulty | INTEGER | CHECK (1-2), NOT NULL | Question difficulty |
| explanation | TEXT | NULL | Why answer is correct |
| created_at | TIMESTAMP | Default | Creation time |

**Sample Data Statistics:**

| Metric | Count |
|--------|-------|
| Total Questions | 33 |
| Difficulty 1 | 18 |
| Difficulty 2 | 15 |
| Concepts Covered | 17 |
| Avg Q per Concept | 1.9 |

**Example Question:**

```
ID: 1
Concept: Variables (ID 1)
Question: "What is a variable in programming?"
A: A container for storing data values
B: A type of function
C: A loop structure
D: A class definition
Correct: A
Difficulty: 1
Explanation: "Variables are containers that store data values..."
```

---

## Analytics Schema

### quiz_submissions table

Tracks every quiz answer submitted by students.

```sql
CREATE TABLE analytics.quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users.students(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES curriculum.questions(id) ON DELETE CASCADE,
  selected_option VARCHAR(1) NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id, question_id) REFERENCES analytics.student_progress(student_id, concept_id)
);
```

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| id | UUID | PK, Default | Unique submission ID |
| student_id | UUID | FK, NOT NULL | Student who submitted |
| question_id | INTEGER | FK, NOT NULL | Question answered |
| selected_option | VARCHAR(1) | CHECK, NOT NULL | Student's choice (A/B/C/D) |
| is_correct | BOOLEAN | NOT NULL | Correct/incorrect flag |
| created_at | TIMESTAMP | Default | Submission timestamp |

**Sample Data:** 50+ submissions from test accounts

---

### student_progress table

Per-concept mastery tracking with Leitner boxes.

```sql
CREATE TABLE analytics.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users.students(id) ON DELETE CASCADE,
  concept_id INTEGER NOT NULL REFERENCES curriculum.concepts(id) ON DELETE CASCADE,
  mastery_score FLOAT NOT NULL DEFAULT 0.0 CHECK (mastery_score >= 0.0 AND mastery_score <= 1.0),
  attempts INTEGER NOT NULL DEFAULT 0,
  correct_attempts INTEGER NOT NULL DEFAULT 0,
  last_reviewed TIMESTAMP,
  leitner_box INTEGER NOT NULL DEFAULT 1 CHECK (leitner_box BETWEEN 1 AND 4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, concept_id)
);
```

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| id | UUID | PK, Default | Unique progress ID |
| student_id | UUID | FK, NOT NULL | Student ID |
| concept_id | INTEGER | FK, NOT NULL | Concept ID |
| mastery_score | FLOAT | 0.0-1.0, Default 0 | EMA mastery score |
| attempts | INTEGER | Default 0 | Total attempts |
| correct_attempts | INTEGER | Default 0 | Correct answers |
| last_reviewed | TIMESTAMP | NULL | Last quiz date |
| leitner_box | INTEGER | 1-4, Default 1 | Spaced repetition level |
| created_at | TIMESTAMP | Default | Creation time |

**Mastery Score Scale:**

| Score | Level | Meaning |
|-------|-------|---------|
| 0.0 - 0.3 | 🔴 Red | Just learning |
| 0.3 - 0.6 | 🟡 Yellow | Making progress |
| 0.6 - 0.85 | 🟠 Orange | Getting proficient |
| 0.85 - 1.0 | 🟢 Green | Mastered |

**Leitner Box Meanings:**

| Box | Meaning | Review Schedule |
|-----|---------|-----------------|
| 1 | New/Struggling | Daily |
| 2 | Building | Every 3 days |
| 3 | Strong | Weekly |
| 4 | Mastered | Bi-weekly |

**Sample Data:** 85 records (5 students × 17 concepts)

---

### student_analytics table

Aggregate statistics for each student.

```sql
CREATE TABLE analytics.student_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES users.students(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_activity TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| id | UUID | PK, Default | Unique record ID |
| student_id | UUID | FK, UNIQUE, NOT NULL | Student ID |
| total_xp | INTEGER | Default 0 | Lifetime XP earned |
| current_streak | INTEGER | Default 0 | Days active in a row |
| best_streak | INTEGER | Default 0 | Best streak ever |
| last_activity | TIMESTAMP | NULL | Last quiz timestamp |
| created_at | TIMESTAMP | Default | Record creation |
| updated_at | TIMESTAMP | Default | Last update time |

**XP Earning Rules:**

- Correct answer: +10 XP
- Difficulty 2 bonus: +5 XP
- Streak multiplier: 1.5x-2x (based on streak)

**Streak Rules:**

- Increments on first correct answer of the day
- Resets after 48 hours of inactivity
- Never goes above best_streak value

**Sample Data:** 5 records (one per student)

---

## Indexes

Performance-critical indexes for fast queries.

```sql
-- Users
CREATE UNIQUE INDEX idx_students_email ON users.students(email);

-- Curriculum
CREATE INDEX idx_concepts_chapter ON curriculum.concepts(chapter_id);
CREATE INDEX idx_questions_concept ON curriculum.questions(concept_id);

-- Analytics
CREATE INDEX idx_submissions_student ON analytics.quiz_submissions(student_id);
CREATE INDEX idx_submissions_question ON analytics.quiz_submissions(question_id);
CREATE INDEX idx_submissions_created ON analytics.quiz_submissions(created_at);

CREATE INDEX idx_progress_student ON analytics.student_progress(student_id);
CREATE INDEX idx_progress_concept ON analytics.student_progress(concept_id);
CREATE INDEX idx_progress_leitner ON analytics.student_progress(leitner_box);

CREATE INDEX idx_student_analytics_student ON analytics.student_analytics(student_id);
```

---

## Relationships

### Foreign Keys

```
students (1) --→ (many) quiz_submissions
students (1) --→ (many) student_progress
students (1) --→ (one) student_analytics

chapters (1) --→ (many) concepts
concepts (1) --→ (many) questions
concepts (1) --→ (many) student_progress

questions (1) --→ (many) quiz_submissions
```

### Cascade Deletes

Deleting a chapter or question automatically deletes related records:

- Delete chapter → Delete all concepts → Delete all questions
- Delete student → Delete all submissions and progress records

---

## Data Insertion Order

When setting up, load in this order:

1. **00_users.sql** - Create users schema
2. **01_curriculum.sql** - Create curriculum schema
3. **02_analytics.sql** - Create analytics schema
4. **03_quiz_submissions.sql** - Create indexes on analytics
5. **04_student_progress.sql** - Add more indexes
6. **05_indexes.sql** - Final performance indexes
7. **DML/01_sample_data.sql** - Load sample students and chapters
8. **DML/sample-questions.sql** - Load sample questions

---

## Query Examples

### Get student progress

```sql
SELECT sp.*, c.name as concept_name, c.id as concept_id
FROM analytics.student_progress sp
JOIN curriculum.concepts c ON sp.concept_id = c.id
WHERE sp.student_id = 'student-uuid'
ORDER BY sp.mastery_score DESC;
```

### Get recent submissions

```sql
SELECT 
  qs.*,
  q.question_text,
  s.first_name,
  c.name as concept_name
FROM analytics.quiz_submissions qs
JOIN curriculum.questions q ON qs.question_id = q.id
JOIN users.students s ON qs.student_id = s.id
JOIN curriculum.concepts c ON q.concept_id = c.id
WHERE qs.created_at > NOW() - INTERVAL '24 hours'
ORDER BY qs.created_at DESC;
```

### Get chapter mastery

```sql
SELECT 
  ch.id,
  ch.name,
  COUNT(DISTINCT c.id) as concept_count,
  AVG(sp.mastery_score) as avg_mastery
FROM curriculum.chapters ch
LEFT JOIN curriculum.concepts c ON ch.id = c.chapter_id
LEFT JOIN analytics.student_progress sp ON c.id = sp.concept_id AND sp.student_id = 'student-uuid'
GROUP BY ch.id, ch.name;
```

---

## Backup & Restore

### Backup

```bash
pg_dump -U postgres edtech_mvp > backup.sql
```

### Restore

```bash
createdb edtech_mvp
psql -U postgres edtech_mvp < backup.sql
```

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Database Size | ~10 MB (sample data) |
| Average Query Time | <50 ms |
| Indexed Columns | 10+ |
| Connection Pool | 5-10 connections |

---

**Last Updated:** January 2024  
**Version:** 1.0
