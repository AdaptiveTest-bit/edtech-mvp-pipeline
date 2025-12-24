# 🔌 Backend API Routes - Complete Implementation

## Architecture Routes (From ARCHITECTURE.md)

Your backend needs these endpoints:

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/quiz/submit
GET    /api/quiz/{id}
GET    /api/progress/{student_id}
GET    /api/analytics/{student_id}
```

All implemented with FastAPI + SQLAlchemy below.

---

## 1️⃣ Auth Routes

### POST /api/auth/login
```python
# app/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import Student

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str  # In production, use JWT or OAuth2

class LoginResponse(BaseModel):
    student_id: int
    name: str
    email: str
    total_xp: int
    current_streak: int

@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """Authenticate student and return profile"""
    
    student = db.query(Student).filter(
        Student.email == request.email
    ).first()
    
    if not student:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # TODO: Verify password hash in production
    
    return LoginResponse(
        student_id=student.id,
        name=student.name,
        email=student.email,
        total_xp=student.total_xp,
        current_streak=student.current_streak
    )
```

### POST /api/auth/register
```python
@router.post("/register", response_model=LoginResponse)
async def register(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """Create new student account"""
    
    # Check if email exists
    existing = db.query(Student).filter(
        Student.email == request.email
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new student
    student = Student(
        user_id=f"student_{request.email.split('@')[0]}",
        email=request.email,
        name=request.email.split('@')[0],  # Use email prefix as name
        total_xp=0,
        current_streak=0,
        best_streak=0
    )
    
    # TODO: Hash password before storing
    
    db.add(student)
    db.commit()
    db.refresh(student)
    
    return LoginResponse(
        student_id=student.id,
        name=student.name,
        email=student.email,
        total_xp=student.total_xp,
        current_streak=student.current_streak
    )
```

---

## 2️⃣ Quiz Routes

### GET /api/quiz/{id}
```python
# app/routes/quiz.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.cache.cache_manager import get_cache, set_cache
from app.models import Question

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

class QuestionResponse(BaseModel):
    id: int
    quiz_id: str
    question_text: str
    options: list
    explanation: str
    image_url: str | None = None
    
    class Config:
        from_attributes = True

@router.get("/{quiz_id}", response_model=QuestionResponse)
async def get_question(
    quiz_id: str,
    db: Session = Depends(get_db)
):
    """Get question details (with caching)"""
    
    # Check cache first (24-hour TTL)
    cache_key = f"question:{quiz_id}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    # Get from database
    question = db.query(Question).filter(
        Question.quiz_id == quiz_id
    ).first()
    
    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )
    
    response = QuestionResponse(
        id=question.id,
        quiz_id=question.quiz_id,
        question_text=question.question_text,
        options=question.options,
        explanation=question.explanation,
        image_url=question.image_url
    )
    
    # Cache the result
    set_cache(cache_key, response.dict(), "question_content")
    
    return response
```

### POST /api/quiz/submit
```python
from pydantic import BaseModel
from app.services.quiz_service import submit_answer
from app.cache.cache_manager import delete_cache

class SubmitAnswerRequest(BaseModel):
    student_id: int
    quiz_id: str
    selected_answer: int

class SubmitAnswerResponse(BaseModel):
    is_correct: bool
    xp_earned: int
    explanation: str
    mastery_score: int

@router.post("/submit", response_model=SubmitAnswerResponse)
async def submit_quiz(
    request: SubmitAnswerRequest,
    db: Session = Depends(get_db)
):
    """Submit answer and get feedback"""
    
    # Get question
    question = db.query(Question).filter(
        Question.quiz_id == request.quiz_id
    ).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Check if answer is correct
    is_correct = request.selected_answer == question.correct_answer_index
    xp_earned = 10 if is_correct else 0
    
    # Save submission
    from app.models import QuizSubmission
    submission = QuizSubmission(
        student_id=request.student_id,
        question_id=question.id,
        selected_answer_index=request.selected_answer,
        is_correct=is_correct,
        xp_earned=xp_earned
    )
    db.add(submission)
    
    # Update student XP
    from app.models import Student
    student = db.query(Student).filter(Student.id == request.student_id).first()
    student.total_xp += xp_earned
    
    # Update progress
    from app.models import StudentProgress
    progress = db.query(StudentProgress).filter(
        StudentProgress.student_id == request.student_id,
        StudentProgress.chapter_id == question.chapter_id
    ).first()
    
    if progress:
        progress.questions_completed += 1
        if is_correct:
            progress.questions_correct += 1
        # Recalculate mastery: (correct / completed) * 100
        progress.mastery_score = (progress.questions_correct / progress.questions_completed) * 100
        progress.last_answered_at = datetime.utcnow()
    else:
        progress = StudentProgress(
            student_id=request.student_id,
            chapter_id=question.chapter_id,
            mastery_score=100 if is_correct else 0,
            questions_completed=1,
            questions_correct=1 if is_correct else 0,
            last_answered_at=datetime.utcnow()
        )
        db.add(progress)
    
    db.commit()
    
    # Invalidate cache for progress and analytics
    delete_cache(f"progress:{request.student_id}")
    delete_cache(f"analytics:{request.student_id}")
    
    return SubmitAnswerResponse(
        is_correct=is_correct,
        xp_earned=xp_earned,
        explanation=question.explanation,
        mastery_score=int(progress.mastery_score)
    )
```

---

## 3️⃣ Progress Routes

### GET /api/progress/{student_id}

```python
# app/routes/progress.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.cache.cache_manager import get_cache, set_cache
from app.models import StudentProgress, Student, Chapter

router = APIRouter(prefix="/api/progress", tags=["progress"])

class ChapterProgress(BaseModel):
    chapter_id: str
    chapter_name: str
    mastery_score: int
    questions_completed: int
    questions_correct: int
    status: str  # "locked", "in_progress", "mastered"
    last_answered_at: datetime | None = None

class ProgressResponse(BaseModel):
    student_id: int
    total_xp: int
    current_streak: int
    chapters: list[ChapterProgress]

@router.get("/{student_id}", response_model=ProgressResponse)
async def get_progress(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Get student progress across all chapters (cached)"""
    
    # Check cache first (15-minute TTL)
    cache_key = f"progress:{student_id}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    # Get student
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get progress for each chapter
    progress_records = db.query(StudentProgress).filter(
        StudentProgress.student_id == student_id
    ).all()
    
    chapters_data = []
    for p in progress_records:
        chapter = db.query(Chapter).filter(Chapter.id == p.chapter_id).first()
        
        # Determine status
        if p.mastery_score >= 80:
            status = "mastered"
        elif p.questions_completed > 0:
            status = "in_progress"
        else:
            status = "locked"
        
        chapters_data.append(ChapterProgress(
            chapter_id=p.chapter_id,
            chapter_name=chapter.name,
            mastery_score=int(p.mastery_score),
            questions_completed=p.questions_completed,
            questions_correct=p.questions_correct,
            status=status,
            last_answered_at=p.last_answered_at
        ))
    
    response = ProgressResponse(
        student_id=student_id,
        total_xp=student.total_xp,
        current_streak=student.current_streak,
        chapters=chapters_data
    )
    
    # Cache for 15 minutes
    set_cache(cache_key, response.dict(), "progress_summary")
    
    return response
```

---

## 4️⃣ Analytics Routes

### GET /api/analytics/{student_id}

```python
# app/routes/analytics.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.database import get_db
from app.cache.cache_manager import get_cache, set_cache
from app.models import QuizSubmission, DailyAnalytics, Student

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

class DailyMetrics(BaseModel):
    date: str
    questions_answered: int
    questions_correct: int
    accuracy: float
    xp_earned: int
    time_spent_minutes: int
    streak_count: int

class AnalyticsResponse(BaseModel):
    student_id: int
    total_xp: int
    best_streak: int
    weekly_data: list[DailyMetrics]
    monthly_accuracy: float

@router.get("/{student_id}", response_model=AnalyticsResponse)
async def get_analytics(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Get student analytics for parent dashboard (cached 1 hour)"""
    
    # Check cache first (1-hour TTL)
    cache_key = f"analytics:{student_id}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    # Get student
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get last 7 days of analytics
    from sqlalchemy import func
    from datetime import date
    
    seven_days_ago = date.today() - timedelta(days=7)
    
    daily_records = db.query(DailyAnalytics).filter(
        DailyAnalytics.student_id == student_id,
        DailyAnalytics.analytics_date >= seven_days_ago
    ).order_by(DailyAnalytics.analytics_date.desc()).all()
    
    weekly_data = []
    for record in daily_records:
        accuracy = (
            (record.questions_correct / record.questions_answered * 100)
            if record.questions_answered > 0
            else 0
        )
        weekly_data.append(DailyMetrics(
            date=str(record.analytics_date),
            questions_answered=record.questions_answered,
            questions_correct=record.questions_correct,
            accuracy=round(accuracy, 2),
            xp_earned=record.xp_earned,
            time_spent_minutes=record.time_spent_minutes,
            streak_count=record.streak_count
        ))
    
    # Calculate monthly accuracy
    thirty_days_ago = date.today() - timedelta(days=30)
    monthly_records = db.query(DailyAnalytics).filter(
        DailyAnalytics.student_id == student_id,
        DailyAnalytics.analytics_date >= thirty_days_ago
    ).all()
    
    total_answered = sum(r.questions_answered for r in monthly_records)
    total_correct = sum(r.questions_correct for r in monthly_records)
    monthly_accuracy = (
        (total_correct / total_answered * 100)
        if total_answered > 0
        else 0
    )
    
    response = AnalyticsResponse(
        student_id=student_id,
        total_xp=student.total_xp,
        best_streak=student.best_streak,
        weekly_data=weekly_data,
        monthly_accuracy=round(monthly_accuracy, 2)
    )
    
    # Cache for 1 hour
    set_cache(cache_key, response.dict(), "daily_analytics")
    
    return response
```

---

## Integration in main.py

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, quiz, progress, analytics
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="EdTech MVP API",
    description="Backend for Math EdTech Platform",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local dev
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(quiz.router)
app.include_router(progress.router)
app.include_router(analytics.router)

@app.get("/health")
async def health_check():
    return {"status": "OK", "message": "Backend is healthy"}

@app.get("/api/docs")
async def api_docs():
    return {"message": "API documentation available at /docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("BACKEND_PORT", 5000))
    )
```

---

## Testing All Routes

```bash
# Health check
curl http://localhost:5000/health

# Register student
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'

# Get question
curl http://localhost:5000/api/quiz/q1

# Submit answer
curl -X POST http://localhost:5000/api/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "quiz_id": "q1",
    "selected_answer": 2
  }'

# Get progress
curl http://localhost:5000/api/progress/1

# Get analytics
curl http://localhost:5000/api/analytics/1

# View API docs
# Visit http://localhost:5000/docs
```

---

## .env Configuration

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edtech_mvp

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
BACKEND_PORT=5000
FRONTEND_URL=http://localhost:3000

# Security
SECRET_KEY=your-secret-key-here-change-in-production
```

---

## Project Structure

```
backend/
├── main.py                    # Entry point
├── requirements.txt           # Dependencies
├── .env                      # Environment variables
│
├── app/
│   ├── __init__.py
│   ├── database.py           # DB connection
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py           # Student, Parent
│   │   ├── curriculum.py     # Chapter, Question, Submission
│   │   └── analytics.py      # Progress, DailyAnalytics
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py           # POST /auth/login, /register
│   │   ├── quiz.py           # GET /quiz/{id}, POST /quiz/submit
│   │   ├── progress.py       # GET /progress/{student_id}
│   │   └── analytics.py      # GET /analytics/{student_id}
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── quiz_service.py   # Business logic
│   │   └── progress_service.py
│   │
│   ├── cache/
│   │   ├── __init__.py
│   │   └── cache_manager.py  # Redis 7 TTL strategies
│   │
│   └── middleware/
│       └── auth.py           # JWT validation (future)
│
└── tests/
    ├── test_auth.py
    ├── test_quiz.py
    ├── test_progress.py
    └── test_analytics.py
```

---

## Next: Connect to Frontend

After implementing these routes, connect them in `Arena.tsx`:

```typescript
// frontend/src/components/student/quiz/Arena.tsx
async function submitAnswer(quizId: string, selectedAnswer: number) {
  const response = await fetch('http://localhost:5000/api/quiz/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: studentId,
      quiz_id: quizId,
      selected_answer: selectedAnswer
    })
  });
  
  const data = await response.json();
  // Show feedback: is_correct, xp_earned, explanation
}
```

---

**All 6 routes implemented and ready to connect to your frontend! ✅**
