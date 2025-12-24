# 🗄️ Backend Database Schema (PostgreSQL + SQLAlchemy)

## Architecture Alignment
- **Database:** PostgreSQL 12+
- **ORM:** SQLAlchemy
- **Connection Pool:** 20 connections
- **Tables:** 7 core tables with proper relationships

---

## Table 1: students

```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    grade_level INT,
    total_xp INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_email ON students(email);
```

**SQLAlchemy Model:**
```python
# app/models/user.py
from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    grade_level = Column(Integer)
    total_xp = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

---

## Table 2: parents

```sql
CREATE TABLE parents (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_parents_user_id ON parents(user_id);
```

**SQLAlchemy Model:**
```python
# app/models/user.py
class Parent(Base):
    __tablename__ = "parents"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

---

## Table 3: student_parent_link

```sql
CREATE TABLE student_parent_link (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id INT NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_parent_student ON student_parent_link(student_id);
CREATE INDEX idx_student_parent_parent ON student_parent_link(parent_id);
```

**SQLAlchemy Model:**
```python
# app/models/user.py
class StudentParentLink(Base):
    __tablename__ = "student_parent_link"
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), index=True)
    parent_id = Column(Integer, ForeignKey("parents.id", ondelete="CASCADE"), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

## Table 4: chapters

```sql
CREATE TABLE chapters (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    order INT,
    is_locked BOOLEAN DEFAULT TRUE,
    unlock_xp_required INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chapters_subject ON chapters(subject);
```

**SQLAlchemy Model:**
```python
# app/models/curriculum.py
class Chapter(Base):
    __tablename__ = "chapters"
    
    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    subject = Column(String(100), nullable=False, index=True)
    order = Column(Integer)
    is_locked = Column(Boolean, default=True)
    unlock_xp_required = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

## Table 5: questions

```sql
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id VARCHAR(255) UNIQUE NOT NULL,
    chapter_id VARCHAR(50) NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,  -- ["Option A", "Option B", "Option C", "Option D"]
    correct_answer_index INT NOT NULL,  -- 0-3
    explanation TEXT,
    image_url VARCHAR(500),
    difficulty_level VARCHAR(20),  -- easy, medium, hard
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_chapter ON questions(chapter_id);
```

**SQLAlchemy Model:**
```python
# app/models/curriculum.py
from sqlalchemy.dialects.postgresql import JSONB

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True)
    quiz_id = Column(String(255), unique=True, nullable=False, index=True)
    chapter_id = Column(String(50), ForeignKey("chapters.id", ondelete="CASCADE"), index=True)
    question_text = Column(Text, nullable=False)
    options = Column(JSONB, nullable=False)  # ["A", "B", "C", "D"]
    correct_answer_index = Column(Integer, nullable=False)
    explanation = Column(Text)
    image_url = Column(String(500))
    difficulty_level = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

## Table 6: quiz_submissions

```sql
CREATE TABLE quiz_submissions (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer_index INT NOT NULL,  -- 0-3
    is_correct BOOLEAN NOT NULL,
    xp_earned INT DEFAULT 0,
    time_taken_seconds INT,  -- How long student took
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_submissions_student ON quiz_submissions(student_id);
CREATE INDEX idx_submissions_question ON quiz_submissions(question_id);
CREATE INDEX idx_submissions_timestamp ON quiz_submissions(submitted_at);
```

**SQLAlchemy Model:**
```python
# app/models/curriculum.py
class QuizSubmission(Base):
    __tablename__ = "quiz_submissions"
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), index=True)
    selected_answer_index = Column(Integer, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    xp_earned = Column(Integer, default=0)
    time_taken_seconds = Column(Integer)
    submitted_at = Column(DateTime, default=datetime.utcnow, index=True)
```

---

## Table 7: student_progress

```sql
CREATE TABLE student_progress (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    chapter_id VARCHAR(50) NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    mastery_score NUMERIC(5,2) DEFAULT 0,  -- 0-100
    questions_completed INT DEFAULT 0,
    questions_correct INT DEFAULT 0,
    last_answered_at TIMESTAMP,
    UNIQUE(student_id, chapter_id)
);

CREATE INDEX idx_progress_student ON student_progress(student_id);
CREATE INDEX idx_progress_chapter ON student_progress(chapter_id);
```

**SQLAlchemy Model:**
```python
# app/models/analytics.py
from sqlalchemy import Numeric

class StudentProgress(Base):
    __tablename__ = "student_progress"
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), index=True)
    chapter_id = Column(String(50), ForeignKey("chapters.id", ondelete="CASCADE"), index=True)
    mastery_score = Column(Numeric(5, 2), default=0)  # 0-100
    questions_completed = Column(Integer, default=0)
    questions_correct = Column(Integer, default=0)
    last_answered_at = Column(DateTime)
```

---

## Table 8: daily_analytics (for caching)

```sql
CREATE TABLE daily_analytics (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    analytics_date DATE NOT NULL,
    questions_answered INT DEFAULT 0,
    questions_correct INT DEFAULT 0,
    xp_earned INT DEFAULT 0,
    time_spent_minutes INT DEFAULT 0,
    streak_count INT DEFAULT 0,
    UNIQUE(student_id, analytics_date)
);

CREATE INDEX idx_daily_analytics_student ON daily_analytics(student_id);
CREATE INDEX idx_daily_analytics_date ON daily_analytics(analytics_date);
```

**SQLAlchemy Model:**
```python
# app/models/analytics.py
from datetime import date

class DailyAnalytics(Base):
    __tablename__ = "daily_analytics"
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), index=True)
    analytics_date = Column(Date, nullable=False, index=True)
    questions_answered = Column(Integer, default=0)
    questions_correct = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    time_spent_minutes = Column(Integer, default=0)
    streak_count = Column(Integer, default=0)
```

---

## Complete SQLAlchemy Setup

### Database Connection
```python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/edtech_mvp"
)

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40,
    pool_recycle=3600,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Initialize All Models
```python
# app/models/__init__.py
from .user import Student, Parent, StudentParentLink
from .curriculum import Chapter, Question, QuizSubmission
from .analytics import StudentProgress, DailyAnalytics
from app.database import Base, engine

# Create all tables
Base.metadata.create_all(bind=engine)

__all__ = [
    "Student",
    "Parent",
    "StudentParentLink",
    "Chapter",
    "Question",
    "QuizSubmission",
    "StudentProgress",
    "DailyAnalytics",
]
```

---

## Redis Caching Strategy (7 TTLs)

```python
# app/cache/cache_manager.py
import redis
from datetime import timedelta
import json
import os

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=0,
    decode_responses=True
)

# TTL Strategies
CACHE_TTL = {
    "student_streak": timedelta(minutes=5),      # 300s - Updates frequently
    "chapter_mastery": timedelta(minutes=30),    # 1800s - Changes less often
    "daily_analytics": timedelta(hours=1),       # 3600s - Daily summary
    "question_content": timedelta(hours=24),     # 86400s - Rarely changes
    "student_profile": timedelta(hours=2),       # 7200s - Profile info
    "progress_summary": timedelta(minutes=15),   # 900s - Progress updates
    "leaderboard": timedelta(hours=6),           # 21600s - Competition data
}

def set_cache(key: str, value: dict, ttl_type: str):
    """Set cached value with appropriate TTL"""
    ttl = CACHE_TTL.get(ttl_type, timedelta(hours=1))
    redis_client.setex(
        key,
        int(ttl.total_seconds()),
        json.dumps(value)
    )

def get_cache(key: str):
    """Get cached value"""
    value = redis_client.get(key)
    return json.loads(value) if value else None

def delete_cache(key: str):
    """Invalidate cache"""
    redis_client.delete(key)
```

---

## ER Diagram

```
students
├── student_parent_link (1:N)
│   └── parents
│
├── quiz_submissions (1:N)
│   ├── questions
│   │   └── chapters
│   └── student_progress (1:N by chapter)
│       └── chapters
│
└── daily_analytics (1:N)
    └── analytics_date (indexed for queries)
```

---

## Quick Reference: Key Queries

### Get Student's Mastery by Chapter
```python
progress = db.query(StudentProgress).filter(
    StudentProgress.student_id == student_id
).all()

# Returns: [{chapter_id: "ch1", mastery_score: 85}, ...]
```

### Get Student's Recent Submissions
```python
submissions = db.query(QuizSubmission).filter(
    QuizSubmission.student_id == student_id
).order_by(QuizSubmission.submitted_at.desc()).limit(10).all()
```

### Get Chapter by ID
```python
chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
```

### Update Streak
```python
student = db.query(Student).filter(Student.id == student_id).first()
student.current_streak += 1
student.best_streak = max(student.best_streak, student.current_streak)
db.commit()
```

---

## Testing Data

```python
# Seed sample data
from app.database import SessionLocal, engine
from app.models import *

db = SessionLocal()

# Add chapters
chapters = [
    Chapter(id="ch1", name="Numbers", subject="Math", order=1),
    Chapter(id="ch2", name="Geometry", subject="Math", order=2),
]
db.add_all(chapters)

# Add student
student = Student(user_id="student_1", email="student@example.com", name="Alice")
db.add(student)

# Add question
question = Question(
    quiz_id="q1",
    chapter_id="ch1",
    question_text="What is 12 × 12?",
    options=["100", "122", "144", "152"],
    correct_answer_index=2,
    explanation="12 × 12 = 144"
)
db.add(question)

db.commit()
```

---

## Production Checklist

- [ ] PostgreSQL 12+ running with proper user permissions
- [ ] Connection pooling configured (pool_size=20)
- [ ] All indexes created for fast queries
- [ ] Redis instance running for caching
- [ ] Environment variables set (.env file)
- [ ] Database backups configured
- [ ] Query performance tested with sample data

---

**This schema is optimized for:**
- Fast student progress queries
- XP/streak updates (write-heavy)
- Analytics aggregations
- Horizontal scaling with Redis caching
