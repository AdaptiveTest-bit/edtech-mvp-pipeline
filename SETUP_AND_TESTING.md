# SETUP_AND_TESTING.md

# 🚀 Backend Setup & Testing Guide

## ✅ Installation Complete!

All dependencies have been installed successfully:
- FastAPI (latest)
- SQLAlchemy 2.0
- Uvicorn with async support
- Pydantic for validation
- Python-dotenv for configuration

---

## 📋 Quick Start

### Step 1: Setup PostgreSQL Database

```bash
# Create database
createdb edtech_mvp

# Verify creation
psql -l | grep edtech_mvp
```

### Step 2: Run DDL Files (In Order!)

```bash
cd database/DDL

# Users schema
psql -U postgres -d edtech_mvp -f 00_users.sql

# Curriculum schema (4-level hierarchy)
psql -U postgres -d edtech_mvp -f 01_curriculum.sql

# Analytics schema
psql -U postgres -d edtech_mvp -f 02_analytics.sql

# Quiz submissions
psql -U postgres -d edtech_mvp -f 03_quiz_submissions.sql

# Student progress & daily analytics
psql -U postgres -d edtech_mvp -f 04_student_progress.sql

# Performance indexes
psql -U postgres -d edtech_mvp -f 05_indexes.sql

# Verify schemas created
psql -U postgres -d edtech_mvp -c "\dn"

# Verify tables
psql -U postgres -d edtech_mvp -c "SELECT table_schema, COUNT(*) FROM information_schema.tables GROUP BY table_schema;"
```

### Step 3: Start Backend Server

```bash
cd backend

# Activate virtual environment
source venv/bin/activate

# Start server
python main.py

# Should see:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete
```

### Step 4: Verify Backend is Running

```bash
# In another terminal
curl http://localhost:8000/health

# Expected response:
# {"status":"ok","message":"Backend is running","environment":"development"}

# View API documentation
# Open browser to: http://localhost:8000/docs
```

---

## 🧪 Testing API Endpoints

### Test 1: Health Check

```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Backend is running",
  "environment": "development"
}
```

### Test 2: Register a Student

```bash
curl -X POST http://localhost:8000/api/auth/register/student \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123",
    "name": "Alice Johnson",
    "grade_level": 5
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "email": "alice@example.com",
  "name": "Alice Johnson",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "token": "token_550e8400-e29b-41d4-a716-446655440000",
  "token_type": "bearer"
}
```

### Test 3: Get a Question

```bash
curl http://localhost:8000/api/quiz/question/1
```

**Expected Response:**
```json
{
  "id": 1,
  "concept_id": 1,
  "content": {
    "text": "What is 2 + 2?",
    "options": {"A": "3", "B": "4", "C": "5", "D": "6"},
    "hint": "Think about basic addition"
  },
  "difficulty_level": 1,
  "explanation": "2 + 2 = 4 because..."
}
```

### Test 4: Submit an Answer

```bash
curl -X POST http://localhost:8000/api/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": 1,
    "student_id": 1,
    "selected_option": "B",
    "time_taken_seconds": 15
  }'
```

**Expected Response:**
```json
{
  "is_correct": true,
  "xp_earned": 10,
  "explanation": "2 + 2 = 4 because...",
  "concept_mastery_score": 0.7,
  "concept_leitner_box": 1,
  "chapter_mastery_score": 70.0,
  "total_xp": 10,
  "next_review_date": "2025-12-28"
}
```

### Test 5: Get Student Progress

```bash
curl http://localhost:8000/api/student/1/progress
```

**Expected Response:**
```json
{
  "student_id": 1,
  "name": "Alice Johnson",
  "total_xp": 10,
  "current_streak": 1,
  "best_streak": 1,
  "chapters": [
    {
      "id": 1,
      "name": "Fractions",
      "mastery_score": 70.0,
      "questions_completed": 1,
      "questions_correct": 1,
      "status": "unlocked"
    }
  ]
}
```

### Test 6: Get Streak Info

```bash
curl http://localhost:8000/api/student/1/streak
```

### Test 7: Get Random Question for Spaced Repetition

```bash
curl http://localhost:8000/api/quiz/random/1?difficulty=2
```

---

## 📊 Database Verification

### Check All Schemas

```bash
psql -U postgres -d edtech_mvp -c "\dn"

# Should show:
# Schema  |  Owner
# --------+-----------
# users   | postgres
# curriculum | postgres
# analytics | postgres
# public  | postgres
```

### Check All Tables in Each Schema

```bash
# Users schema
psql -U postgres -d edtech_mvp -c "\dt users.*"

# Curriculum schema
psql -U postgres -d edtech_mvp -c "\dt curriculum.*"

# Analytics schema
psql -U postgres -d edtech_mvp -c "\dt analytics.*"
```

### Sample Query to Verify Data

```bash
# Connect to database
psql -U postgres edtech_mvp

# Check students table
SELECT COUNT(*) FROM users.students;

# Check chapters
SELECT COUNT(*) FROM curriculum.chapters;

# Check mastery tracking
SELECT COUNT(*) FROM analytics.student_mastery;

# Check student progress
SELECT COUNT(*) FROM analytics.student_progress;
```

---

## 🔗 Frontend Integration

### Connect Next.js Frontend

In your Next.js components, import and use API calls:

```typescript
const API_BASE = "http://localhost:8000";

// Example in a React component
export default function QuizPage() {
  const [question, setQuestion] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/quiz/random/1`)
      .then(res => res.json())
      .then(setQuestion);
  }, []);

  const handleSubmit = async (answer) => {
    const response = await fetch(`${API_BASE}/api/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_id: question.id,
        student_id: 1,
        selected_option: answer
      })
    });

    const feedback = await response.json();
    // Update UI with feedback
  };

  return (
    // JSX...
  );
}
```

---

## 🐛 Troubleshooting

### Issue: "relation 'users.students' does not exist"

**Solution:** Verify DDL files were run in correct order:
```bash
psql -U postgres -d edtech_mvp -c "\dt users.students"
```

### Issue: "schema 'users' does not exist"

**Solution:** Run 00_users.sql first:
```bash
psql -U postgres -d edtech_mvp -f database/DDL/00_users.sql
```

### Issue: Connection refused on port 8000

**Solution:** Verify server is running:
```bash
ps aux | grep python
# Should show: python main.py
```

### Issue: CORS error from frontend

**Solution:** CORS is already enabled in `app/__init__.py` for localhost:3000

### Issue: "No module named 'app'"

**Solution:** Activate virtual environment:
```bash
source venv/bin/activate
```

---

## 📈 Performance Testing

### Load Test with Multiple Requests

```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:8000/health

# Using curl in loop
for i in {1..50}; do curl http://localhost:8000/health; done
```

### Monitor Database

```bash
# Check active connections
psql -U postgres -d edtech_mvp -c "SELECT * FROM pg_stat_activity;"

# Check index usage
psql -U postgres -d edtech_mvp -c "SELECT schemaname, tablename, indexname FROM pg_indexes WHERE schemaname IN ('users', 'curriculum', 'analytics');"
```

---

## 🎯 Next Steps

1. **Insert Sample Data:**
   - Create sample questions
   - Create sample chapters, topics, concepts
   - Run DML scripts from `database/DML/`

2. **Test All 8 Endpoints:**
   - POST /api/auth/register/student
   - POST /api/auth/login
   - POST /api/quiz/submit
   - GET /api/quiz/question/{id}
   - GET /api/quiz/random/{concept_id}
   - GET /api/student/{id}/progress
   - GET /api/student/{id}/streak
   - GET /api/progress/student/{id}

3. **Connect Frontend:**
   - Start Next.js dev server on port 3000
   - Test API calls from browser
   - Verify CORS works
   - Test all components

4. **Monitor Performance:**
   - Check database query times
   - Monitor API response times
   - Use FastAPI /docs for testing

---

## 📝 Project Status

✅ Backend Structure: Complete
✅ Database Schema: Complete
✅ SQLAlchemy Models: Complete  
✅ API Endpoints: Complete (8 endpoints)
✅ Service Layer: Complete
✅ CORS Enabled: Yes
✅ Dependencies Installed: Yes
✅ Configuration Ready: Yes

🔄 Next: Insert sample data → Test endpoints → Connect frontend

---

**All systems ready for development!** 🚀
