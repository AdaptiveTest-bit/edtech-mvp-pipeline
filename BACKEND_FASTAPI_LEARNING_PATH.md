# 🚀 Backend Learning Path - FastAPI + Python (JIT)

## ⚠️ CORRECTION: Using FastAPI, NOT Express.js

Your architecture specifies:
- **Backend:** FastAPI (async Python) ✅
- **Database:** PostgreSQL 12+ ✅
- **Caching:** Redis 6+ ✅
- **ORM:** SQLAlchemy ✅

This guide teaches you FastAPI **exactly when you need it** for your EdTech MVP.

---

## 🎯 Phase 1: This Week (Quiz Engine)

### What You Need to Learn (In Order)
1. **FastAPI Basics** (20 mins)
2. **SQLAlchemy Models** (20 mins)
3. **First Endpoint: POST /api/quiz/submit** (45 mins)
4. **Testing** (15 mins)

**Total Time: 1.5 hours** ⏱️

---

## 1️⃣ FastAPI Basics - Learn NOW

### Why FastAPI?
- Async/await for high performance (handles 10,000+ concurrent users)
- Automatic OpenAPI docs (built-in API documentation)
- Type hints with Pydantic (validation + serialization)
- Lightning fast execution

### Setup (5 mins)

```bash
# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv
```

### Minimal FastAPI Server (20 mins)

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="EdTech MVP API")

# Allow frontend requests (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Your first endpoint
@app.post("/api/quiz/submit")
async def submit_quiz(
    quiz_id: int,
    student_id: int,
    selected_answer: int
):
    """
    Submit an answer and get immediate feedback
    
    Request: { quizId: 1, studentId: 5, selectedAnswer: 0 }
    Response: { isCorrect: true, xpEarned: 10, explanation: "..." }
    """
    try:
        # Step 1: Get question from DB
        question = await get_question(quiz_id)
        
        # Step 2: Check if correct
        is_correct = selected_answer == question.correct_answer_index
        xp_earned = 10 if is_correct else 0
        
        # Step 3: Save submission
        await save_submission(
            student_id=student_id,
            question_id=question.id,
            selected_answer=selected_answer,
            is_correct=is_correct,
            xp_earned=xp_earned
        )
        
        # Step 4: Update mastery
        await update_mastery(student_id, question.chapter_id, is_correct)
        
        # Step 5: Return response
        return {
            "isCorrect": is_correct,
            "xpEarned": xp_earned,
            "explanation": question.explanation,
            "masteryScore": 75  # Get from DB
        }
    
    except Exception as e:
        return {"error": str(e), "statusCode": 500}

# Health check
@app.get("/health")
async def health_check():
    return {"status": "OK", "message": "Backend is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
```

### Run It
```bash
python main.py
# Server running on http://localhost:5000
# API docs on http://localhost:5000/docs
```

### Key Concepts (That's It!)
- `@app.post()` - Handle POST requests
- `async def` - Asynchronous function (handles multiple users simultaneously)
- `await` - Wait for async operation to complete
- Request params become function arguments (type hints)
- Return dict automatically converts to JSON

---

## 2️⃣ PostgreSQL + SQLAlchemy - Learn NOW

### Database Setup (20 mins)

```bash
# Mac
brew install postgresql@15
brew services start postgresql@15

# Verify
psql --version
```

### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql:
CREATE DATABASE edtech_mvp;
\c edtech_mvp
```

### SQLAlchemy Models (Instead of Raw SQL)

```python
# backend/app/models/user.py
from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(255), unique=True)
    email = Column(String(255), unique=True)
    name = Column(String(255))
    total_xp = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
```

```python
# backend/app/models/quiz.py
from sqlalchemy import Column, Integer, String, Text, JSON
from datetime import datetime

Base = declarative_base()

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True)
    quiz_id = Column(Integer, unique=True)
    chapter_id = Column(String(50))
    question_text = Column(Text)
    options = Column(JSON)  # ["A", "B", "C", "D"]
    correct_answer_index = Column(Integer)  # 0-3
    explanation = Column(Text)
    image_url = Column(String(500), nullable=True)

class QuizSubmission(Base):
    __tablename__ = "quiz_submissions"
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer)  # Foreign key
    question_id = Column(Integer)  # Foreign key
    selected_answer_index = Column(Integer)
    is_correct = Column(Boolean)
    xp_earned = Column(Integer, default=0)
    submitted_at = Column(DateTime, default=datetime.now)
```

### Database Connection

```python
# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import os

# Connection string
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/edtech_mvp"
)

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40,
    echo=False
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Create Tables

```python
# backend/app/models/__init__.py
from .user import Student
from .quiz import Question, QuizSubmission
from app.database import Base, engine

# Create all tables
Base.metadata.create_all(bind=engine)
```

Run this once:
```bash
python -c "from app.models import *"
# Tables created automatically!
```

---

## 3️⃣ POST /api/quiz/submit Endpoint - Build THIS NOW

### Complete Implementation

```python
# backend/app/services/quiz_service.py
from sqlalchemy.orm import Session
from app.models import Question, QuizSubmission, StudentProgress
from datetime import datetime

async def submit_answer(
    db: Session,
    student_id: int,
    question_id: int,
    selected_answer: int
):
    """Submit answer and get feedback"""
    
    # 1. Get question
    question = db.query(Question).filter(
        Question.id == question_id
    ).first()
    
    if not question:
        return {"error": "Question not found"}, 404
    
    # 2. Check if correct
    is_correct = selected_answer == question.correct_answer_index
    xp_earned = 10 if is_correct else 0
    
    # 3. Save submission
    submission = QuizSubmission(
        student_id=student_id,
        question_id=question_id,
        selected_answer_index=selected_answer,
        is_correct=is_correct,
        xp_earned=xp_earned
    )
    db.add(submission)
    db.commit()
    
    # 4. Update student progress
    progress = db.query(StudentProgress).filter(
        StudentProgress.student_id == student_id,
        StudentProgress.chapter_id == question.chapter_id
    ).first()
    
    if progress:
        # Update existing progress
        current_score = progress.mastery_score
        completed = progress.questions_completed + 1
        new_score = (current_score * (completed - 1) + (100 if is_correct else 0)) / completed
        progress.mastery_score = int(new_score)
        progress.questions_completed = completed
    else:
        # Create new progress
        progress = StudentProgress(
            student_id=student_id,
            chapter_id=question.chapter_id,
            mastery_score=100 if is_correct else 0,
            questions_completed=1
        )
        db.add(progress)
    
    db.commit()
    
    # 5. Return response
    return {
        "isCorrect": is_correct,
        "xpEarned": xp_earned,
        "explanation": question.explanation,
        "masteryScore": int(progress.mastery_score)
    }, 200


# backend/app/routes/quiz.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.quiz_service import submit_answer
from pydantic import BaseModel

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

class SubmitAnswerRequest(BaseModel):
    quiz_id: int
    student_id: int
    selected_answer: int

@router.post("/submit")
async def submit_quiz(
    request: SubmitAnswerRequest,
    db: Session = Depends(get_db)
):
    """Submit an answer and get feedback"""
    response, status_code = await submit_answer(
        db,
        request.student_id,
        request.quiz_id,
        request.selected_answer
    )
    
    if status_code == 200:
        return response
    else:
        return {"error": response["error"]}, status_code
```

### Connect to Main App

```python
# backend/main.py
from fastapi import FastAPI
from app.routes import quiz

app = FastAPI()

# Include routes
app.include_router(quiz.router)

@app.get("/health")
async def health():
    return {"status": "OK"}
```

---

## 🧪 Test Your Endpoint

### Using FastAPI Docs (Easiest)
1. Go to http://localhost:5000/docs
2. Find POST /api/quiz/submit
3. Click "Try it out"
4. Enter values:
```json
{
  "quiz_id": 1,
  "student_id": 1,
  "selected_answer": 0
}
```
5. Click "Execute"

### Expected Response
```json
{
  "isCorrect": true,
  "xpEarned": 10,
  "explanation": "12 × 12 = 144...",
  "masteryScore": 85
}
```

---

## 📝 Project Structure

```
backend/
├── main.py                          # Entry point
├── requirements.txt                 # Dependencies
├── .env                            # Environment variables
│
├── app/
│   ├── __init__.py
│   ├── database.py                 # DB connection & session
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                 # Student, Parent models
│   │   └── quiz.py                 # Question, Submission models
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── quiz.py                 # POST /quiz/submit
│   │   └── progress.py             # GET /progress
│   │
│   └── services/
│       ├── __init__.py
│       ├── quiz_service.py         # Business logic
│       └── progress_service.py     # Mastery calculation
│
└── tests/
    ├── test_quiz.py
    └── test_progress.py
```

---

## 📦 requirements.txt

```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-dotenv==1.0.0
pydantic==2.5.0
```

---

## 🚀 Run Everything

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start server
python main.py
# ✅ Backend running on http://localhost:5000

# 3. Check health
curl http://localhost:5000/health

# 4. Access API docs
# Visit http://localhost:5000/docs
```

---

## ✅ Learning Checklist (This Week)

- [ ] FastAPI basics (20 mins)
- [ ] PostgreSQL setup (20 mins)
- [ ] SQLAlchemy models (20 mins)
- [ ] First endpoint POST /quiz/submit (45 mins)
- [ ] Test with FastAPI docs (10 mins)
- [ ] Connect to Arena component (20 mins)

**Total Time: 2 hours** ✅

---

## 🎯 Next Week (Phase 2)

```python
# GET /api/student/progress
@app.get("/api/student/progress/{student_id}")
async def get_progress(student_id: int, db: Session = Depends(get_db)):
    """Get all mastery scores for SubjectMap"""
    progress = db.query(StudentProgress).filter(
        StudentProgress.student_id == student_id
    ).all()
    
    return {
        "chapters": [
            {
                "id": p.chapter_id,
                "masteryScore": p.mastery_score,
                "questionsCompleted": p.questions_completed,
                "status": "unlocked" if p.mastery_score >= 0 else "locked"
            }
            for p in progress
        ]
    }
```

---

## 🆘 Common Issues

### "ModuleNotFoundError: No module named 'fastapi'"
```bash
pip install -r requirements.txt
```

### "FATAL: role 'postgres' does not exist"
```bash
createuser -s postgres
```

### "psycopg2: FATAL: database 'edtech_mvp' does not exist"
```bash
createdb edtech_mvp
```

---

## ✨ You've Got This!

You now have everything to build a production-ready FastAPI backend aligned with your architecture.

**Start with:**
1. Setup PostgreSQL
2. Create models
3. Build POST /quiz/submit
4. Test with FastAPI docs
5. Connect to frontend

**Happy coding!** 🚀
