# backend/DATAFLOW_ARCHITECTURE.md

# 📊 Complete Data Flow Architecture

## Overview

This document details the complete data flow from database → backend → frontend for the EdTech MVP platform.

---

## 1️⃣ Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js/React)                    │
│  - Arena.tsx (Quiz rendering)                              │
│  - FeedbackOverlay.tsx (Results)                            │
│  - MissionControl.tsx (Dashboard)                           │
│  - WeaknessRadar.tsx (Parent monitoring)                    │
└─────────────────────────────────────────────────────────────┘
                          ↕️ AXIOS/FETCH
┌─────────────────────────────────────────────────────────────┐
│              API GATEWAY (FastAPI - port 8000)               │
│  Routes: /api/auth, /api/quiz, /api/student, /api/progress │
└─────────────────────────────────────────────────────────────┘
                          ↕️ SQLAlchemy ORM
┌─────────────────────────────────────────────────────────────┐
│        SERVICE LAYER (Business Logic)                        │
│  - QuizService (submissions, questions)                     │
│  - StudentService (progress, mastery)                       │
│  - MasteryService (Leitner box, EMA)                        │
│  - ResponseFormatter (frontend formatting)                  │
└─────────────────────────────────────────────────────────────┘
                          ↕️ Direct Queries
┌─────────────────────────────────────────────────────────────┐
│        DATABASE LAYER (PostgreSQL)                           │
│  - Users schema (students, parents)                         │
│  - Curriculum schema (4-level hierarchy)                    │
│  - Analytics schema (mastery, progress, attempts)           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ Quiz Submission Flow (Complete)

### Step-by-Step: Student Answers a Question

```
FRONTEND (Arena.tsx)
    │
    ├─ User selects answer (A, B, C, or D)
    ├─ Calculates time_taken_seconds
    │
    └─→ POST /api/quiz/submit
            {
              "question_id": 1,
              "student_id": 1,
              "selected_option": "C",
              "time_taken_seconds": 15
            }
            │
            BACKEND (quiz.py router)
            │
            ├─ Validates request (Pydantic schema)
            │
            └─→ QuizService.submit_answer()
                    │
                    ├─ 1️⃣ Fetch Question from DB
                    │   SELECT * FROM curriculum.questions WHERE id = 1
                    │   Returns: {id, concept_id, content (JSONB), correct_option_key, explanation}
                    │
                    ├─ 2️⃣ Check if Answer is Correct
                    │   is_correct = (selected_option == correct_option_key)
                    │   xp_earned = 10 if correct else 0
                    │
                    ├─ 3️⃣ Record Attempt
                    │   INSERT INTO analytics.attempts
                    │   (user_id, question_id, is_correct, selected_option, time_taken_seconds)
                    │
                    ├─ 4️⃣ Record Submission
                    │   INSERT INTO analytics.quiz_submissions
                    │   (user_id, question_id, is_correct, xp_earned)
                    │
                    ├─ 5️⃣ Update Student XP
                    │   UPDATE users.students
                    │   SET total_xp = total_xp + xp_earned
                    │
                    ├─ 6️⃣ Update Concept Mastery (Leitner Box + EMA)
                    │   │
                    │   └─→ MasteryService.update_mastery_score()
                    │       ├─ Calculate EMA:
                    │       │   new_score = 0.3 * (1 if correct else 0) + 0.7 * old_score
                    │       │
                    │       ├─ Update Leitner Box:
                    │       │   if correct: box = min(box + 1, 4)  # Progress forward
                    │       │   else: box = 1                       # Back to box 1
                    │       │
                    │       ├─ Calculate Next Review:
                    │       │   days = [1, 3, 7, 14][box]
                    │       │   next_review = today + days
                    │       │
                    │       └─ UPDATE analytics.student_mastery
                    │           (mastery_score, leitner_box, next_review_date)
                    │
                    ├─ 7️⃣ Get Concept Hierarchy (for chapter update)
                    │   SELECT topic_id FROM curriculum.concepts WHERE id = concept_id
                    │   SELECT chapter_id FROM curriculum.topics WHERE id = topic_id
                    │
                    ├─ 8️⃣ Update Chapter Progress
                    │   UPDATE analytics.student_progress
                    │   SET questions_completed = questions_completed + 1,
                    │       questions_correct = questions_correct + (1 if correct else 0),
                    │       mastery_score = (correct / completed) * 100
                    │
                    └─→ Response (formatted for Frontend)
                            {
                              "is_correct": true,
                              "xp_earned": 10,
                              "explanation": "2+2=4 because...",
                              "concept_mastery_score": 0.75,
                              "concept_leitner_box": 2,
                              "chapter_mastery_score": 85.5,
                              "total_xp": 150,
                              "next_review_date": "2025-12-28"
                            }
                            │
                            FRONTEND (FeedbackOverlay.tsx)
                            │
                            ├─ Display is_correct (green ✅ or red ❌)
                            ├─ Show xp_earned ("+10 XP")
                            ├─ Display explanation
                            ├─ Update StreakCounter (current_streak)
                            ├─ Update mastery bar
                            │
                            └─ After 3 seconds, show next question
```

---

## 3️⃣ Dashboard Progress Flow

### Student Loads MissionControl Dashboard

```
FRONTEND (MissionControl.tsx)
    │
    useEffect(() => {
        fetch(`/api/student/{studentId}/progress`)
    })
    │
    GET /api/student/1/progress
    │
    BACKEND (student.py router)
    │
    └─→ StudentService.get_student_progress(student_id=1)
        │
        ├─ 1️⃣ Get Student Record
        │   SELECT * FROM users.students WHERE id = 1
        │
        ├─ 2️⃣ Get All Chapter Progress
        │   SELECT * FROM analytics.student_progress WHERE user_id = 1
        │
        ├─ 3️⃣ For Each Chapter, Get Details
        │   SELECT name FROM curriculum.chapters WHERE id = chapter_id
        │
        └─→ Response (formatted for Dashboard)
                {
                  "student_id": 1,
                  "name": "Alice Johnson",
                  "total_xp": 150,
                  "current_streak": 3,
                  "best_streak": 5,
                  "chapters": [
                    {
                      "id": 1,
                      "name": "Fractions",
                      "masteryScore": 85.5,
                      "questionsCompleted": 11,
                      "questionsCorrect": 9,
                      "status": "unlocked"
                    },
                    {
                      "id": 2,
                      "name": "Decimals",
                      "masteryScore": 0.0,
                      "questionsCompleted": 0,
                      "questionsCorrect": 0,
                      "status": "locked"
                    }
                  ]
                }
                │
                FRONTEND
                │
                ├─ MissionControl: Render SubjectMap with chapters
                ├─ Update XP counter: 150
                ├─ Update streak: 3
                └─ Color code chapters by mastery (red: 0-33%, yellow: 34-66%, green: 67-100%)
```

---

## 4️⃣ Parent Monitoring Flow (WeaknessRadar)

### Parent Checks Child's Progress

```
FRONTEND (NarrativeReport.tsx + WeaknessRadar.tsx)
    │
    useEffect(() => {
        fetch(`/api/student/{childId}/progress`)
    })
    │
    GET /api/student/1/progress
    │
    [Same as Dashboard Flow]
    │
    Response includes all chapters with mastery scores
    │
    FRONTEND (WeaknessRadar.tsx)
    │
    ├─ Transform data for radar chart:
    │   ├─ X-axis: Chapter names (Fractions, Decimals, Geometry...)
    │   ├─ Y-axis: Mastery score (0-100%)
    │   └─ Show weaknesses (low scores) prominently
    │
    └─ Display insights:
        ├─ "Alice needs help with Geometry (23%)"
        ├─ "Strong in Fractions (95%)"
        └─ "Last activity: 2 hours ago"
```

---

## 5️⃣ Spaced Repetition Flow (Leitner Box)

### System Selects Next Question to Review

```
FRONTEND (QuizProgress.tsx)
    │
    When showing next question:
    GET /api/quiz/random/{conceptId}?difficulty=2
    │
    BACKEND (quiz.py router)
    │
    └─→ QuizService.get_random_question(concept_id=1, difficulty=2)
        │
        ├─ 1️⃣ Check Student's Mastery for This Concept
        │   SELECT * FROM analytics.student_mastery
        │   WHERE user_id = 1 AND concept_id = 1
        │   Returns: {mastery_score, leitner_box, next_review_date}
        │
        ├─ 2️⃣ Smart Scheduling Logic
        │   if next_review_date <= today:
        │       → Question is DUE for review
        │   else:
        │       → Question can wait, show different concept
        │
        ├─ 3️⃣ Get Random Question at Appropriate Difficulty
        │   SELECT * FROM curriculum.questions
        │   WHERE concept_id = 1 AND difficulty_level = 2
        │   ORDER BY RANDOM() LIMIT 1
        │
        └─→ Return question
                │
                FRONTEND (Arena.tsx)
                │
                ├─ Display question content (JSONB parsed)
                ├─ Show difficulty level (1=Easy, 2=Medium, 3=Hard)
                └─ User answers → Back to Quiz Submission Flow
```

---

## 6️⃣ Data Model Relationships

```
USERS SCHEMA
├─ students
│  ├─ id (PK)
│  ├─ email
│  ├─ name
│  ├─ total_xp
│  ├─ current_streak
│  └─ best_streak

CURRICULUM SCHEMA (4-Level Hierarchy)
├─ chapters (Level 1)
│  ├─ id (PK)
│  └─ name
│
├─ topics (Level 2)
│  ├─ id (PK)
│  ├─ chapter_id (FK → chapters)
│  └─ name
│
├─ concepts (Level 3)
│  ├─ id (PK)
│  ├─ topic_id (FK → topics)
│  └─ name
│
└─ questions (Level 4)
   ├─ id (PK)
   ├─ concept_id (FK → concepts)
   ├─ content (JSONB)
   ├─ correct_option_key
   └─ explanation

ANALYTICS SCHEMA
├─ attempts (Raw data)
│  ├─ id (PK, UUID)
│  ├─ user_id (FK → students)
│  ├─ question_id (FK → questions)
│  ├─ is_correct
│  └─ time_taken_seconds
│
├─ student_mastery (Concept-level)
│  ├─ id (PK)
│  ├─ user_id (FK → students)
│  ├─ concept_id (FK → concepts)
│  ├─ mastery_score (EMA: 0.0-1.0)
│  ├─ leitner_box (1-4)
│  └─ next_review_date
│
├─ student_progress (Chapter-level)
│  ├─ id (PK)
│  ├─ user_id (FK → students)
│  ├─ chapter_id (FK → chapters)
│  ├─ mastery_score (0-100%)
│  ├─ questions_completed
│  └─ questions_correct
│
└─ quiz_submissions
   ├─ id (PK)
   ├─ user_id (FK → students)
   ├─ question_id (FK → questions)
   ├─ is_correct
   └─ xp_earned
```

---

## 7️⃣ API Response Flow to Components

### Quiz Submission Response → Frontend Components

```
POST /api/quiz/submit Response
│
├─→ is_correct + xp_earned
│   └─→ FeedbackOverlay.tsx
│       ├─ Show success/failure animation
│       ├─ Display XP gained
│       └─ Show streak update
│
├─→ explanation
│   └─→ FeedbackOverlay.tsx (Explanation section)
│
├─→ concept_mastery_score + concept_leitner_box
│   └─→ QuizProgress.tsx (Progress bar)
│       ├─ Show mastery percentage
│       ├─ Show Leitner box level (1-4)
│       └─ Update progress visual
│
├─→ chapter_mastery_score
│   └─→ MissionControl.tsx (SubjectMap)
│       ├─ Update chapter color
│       ├─ Update mastery percentage
│       └─ Unlock next chapter if needed
│
├─→ total_xp
│   └─→ MissionControl.tsx (XP counter)
│       └─ Update total XP display
│
└─→ next_review_date
    └─→ Backend scheduling
        ├─ Don't show this concept again until next_review_date
        ├─ Show other concepts instead
        └─ Implement spaced repetition
```

---

## 8️⃣ Database Query Performance

### Indexes for Speed

All implemented in `database/DDL/05_indexes.sql`:

```sql
-- Fast question retrieval
CREATE INDEX idx_questions_concept_difficulty 
ON curriculum.questions(concept_id, difficulty_level);

-- Fast mastery lookup
CREATE INDEX idx_student_mastery_user_concept
ON analytics.student_mastery(user_id, concept_id);

-- Fast progress lookup
CREATE INDEX idx_student_progress_user_chapter
ON analytics.student_progress(user_id, chapter_id);

-- Fast next-review scheduling
CREATE INDEX idx_mastery_next_review
ON analytics.student_mastery(next_review_date);
```

### Query Optimization

- **Connection pooling:** 20 connections, max 40 overflow
- **Search path:** Configured for cross-schema queries
- **Lazy loading:** Use `.first()` for single records, not `.all()`
- **Indexed lookups:** All FK joins use indexed columns

---

## 9️⃣ Error Handling Flow

### Error Scenarios

```
Scenario 1: Question Not Found
    GET /api/quiz/question/999
    │
    └─→ 404: {"error": "Question not found"}
        └─→ Frontend (Arena.tsx)
            └─ Show error message to user

Scenario 2: Invalid Answer Format
    POST /api/quiz/submit {"selected_option": "Z"}
    │
    └─→ 422: Pydantic validation error
        └─→ Frontend shows validation error

Scenario 3: Student Not Found
    GET /api/student/999/progress
    │
    └─→ 404: {"error": "Student not found"}
        └─→ Frontend redirects to login

Scenario 4: Database Connection Lost
    Any request
    │
    └─→ 500: {"error": "Database connection failed"}
        └─→ Frontend shows "Service temporarily unavailable"
```

---

## 🔟 Performance Metrics

### Expected Response Times

| Endpoint | Time | Notes |
|----------|------|-------|
| GET /api/quiz/question/{id} | 10-20ms | Cached JSONB content |
| GET /api/quiz/random/{concept_id} | 15-30ms | Random ORDER BY |
| POST /api/quiz/submit | 50-100ms | Multiple writes |
| GET /api/student/{id}/progress | 30-60ms | Join with chapters |
| GET /api/student/{id}/streak | 5-10ms | Single row lookup |

### Scaling

- **Single instance:** Handles ~500 concurrent users
- **With connection pooling:** Can scale to 10,000+ concurrent users
- **With Redis caching:** Cache frequently accessed chapters/questions

---

## 1️⃣1️⃣ Security Considerations

### Currently NOT Implemented (TODO)

```python
# JWT Authentication (add in next phase)
- @app.get("/api/student/{student_id}/progress")
- def get_progress(student_id: int, token: str = Depends(oauth2_scheme)):
-     # Verify token matches student_id

# Password Hashing (add in auth.py)
- from bcrypt import hashpw, checkpw
- hashed_password = hashpw(password, bcrypt.gensalt())

# Rate Limiting (add middleware)
- from slowapi import Limiter
- limiter = Limiter(key_func=get_remote_address)
- @app.post("/api/quiz/submit")
- @limiter.limit("10/minute")

# Input Sanitization (already done with Pydantic)
```

---

## 1️⃣2️⃣ Example: Complete Student Journey

```
1. Student logs in
   POST /api/auth/login
   ├─ Returns: token, student_id
   └─ Frontend stores token in localStorage

2. Student navigates to Fractions chapter
   GET /api/quiz/random/1?difficulty=2
   ├─ Returns: Question about fractions
   └─ Frontend displays in Arena.tsx

3. Student answers question
   POST /api/quiz/submit
   │
   ├─ Backend logic:
   │  ├─ Check answer (correct ✅)
   │  ├─ Update EMA: 0.7 * 0.0 + 0.3 * 1.0 = 0.30
   │  ├─ Update Leitner: box 1 → box 2
   │  ├─ Add 10 XP: 0 → 10
   │  ├─ Update chapter progress: 1 question, 1 correct
   │  └─ Set next review: 3 days from now
   │
   └─ Response: {is_correct: true, xp_earned: 10, ...}

4. FeedbackOverlay shows success
   ├─ Displays "+10 XP"
   ├─ Shows explanation
   └─ Updates streak counter

5. Student clicks "Next Question"
   GET /api/quiz/random/2?difficulty=2
   ├─ Different concept (Decimals)
   ├─ Returns new question
   └─ Frontend displays next question

6. Parent checks dashboard
   GET /api/student/1/progress
   ├─ Returns: All chapters with mastery scores
   ├─ Fractions: 33% (1/3 questions correct)
   ├─ Decimals: 0% (not started)
   └─ WeaknessRadar displays radar chart
```

---

## Summary: Data Always Flows

```
User Action → Frontend Event → API Call → Backend Logic → Database Query
    ↓             ↓              ↓           ↓              ↓
Student       Click           POST/GET    Service        UPDATE/INSERT
answers       "Submit"        /api/...    calculates      student_mastery
question      button                      mastery
    
    ↓
Response → Frontend Update → UI Change → User Sees Result
    ↓         ↓               ↓           ↓
JSON       Component         State       "+10 XP"
response   re-renders        updates     animation
```

**Key Principle:** Every button click triggers a full data flow cycle! 🔄
