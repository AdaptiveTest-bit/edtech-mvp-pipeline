# 🔌 COMPLETE API REFERENCE

**Updated:** December 25, 2025  
**Base URL:** `http://localhost:8000`  
**API Version:** v1

---

## 📚 API Overview

- **Total Endpoints:** 25+
- **Response Format:** JSON
- **Authentication:** JWT token in Authorization header
- **CORS:** Configured for localhost:3000 and localhost:3001

---

## 🔐 Authentication Endpoints

### Register New Student
```http
POST /api/auth/register/student
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123",
  "name": "Student Name",
  "grade_level": 10
}

Response 201:
{
  "id": 1,
  "email": "student@example.com",
  "name": "Student Name",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}

Response 200:
{
  "id": 1,
  "email": "student@example.com",
  "name": "Student Name",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 👤 Student Data Endpoints

### Get Student Profile
```http
GET /api/student/{student_id}

Response 200:
{
  "id": 1,
  "email": "student@example.com",
  "name": "Student Name",
  "grade_level": 10,
  "created_at": "2025-12-25T09:00:00"
}
```

### Get Student Progress
```http
GET /api/student/{student_id}/progress

Response 200:
{
  "name": "Student Name",
  "total_xp": 1250,
  "current_streak": 5,
  "best_streak": 12,
  "chapters": [
    {
      "chapter_id": 1,
      "name": "Fractions",
      "status": "in_progress",
      "mastery_score": 75.5,
      "questions_completed": 45,
      "questions_correct": 34
    }
  ]
}
```

### Get Streak Data
```http
GET /api/student/{student_id}/streak

Response 200:
{
  "current_streak": 5,
  "best_streak": 12,
  "streak_started": "2025-12-21",
  "last_activity": "2025-12-25T14:30:00"
}
```

### Get Mastery Scores
```http
GET /api/student/{student_id}/mastery

Response 200:
{
  "overall_mastery": 68.5,
  "by_subject": {
    "mathematics": 75.2,
    "science": 65.8,
    "language": 62.0
  },
  "by_chapter": [
    {
      "chapter_id": 1,
      "name": "Fractions",
      "score": 78.5
    }
  ]
}
```

---

## 🎓 Onboarding Endpoints

### Save Onboarding Data
```http
POST /api/onboarding/save?student_id=1
Content-Type: application/json

{
  "avatar": "🧑",
  "goals": {
    "mathematics": true,
    "science": true,
    "language": false,
    "history": false
  },
  "baseline_score": 65.5
}

Response 200:
{
  "status": "success",
  "message": "Onboarding completed",
  "completed": true
}
```

### Check Onboarding Status
```http
GET /api/onboarding/status/{student_id}

Response 200:
{
  "student_id": 1,
  "completed": true,
  "status": "completed",
  "avatar_selected": "🧑",
  "goals_selected": ["mathematics", "science"],
  "baseline_score": 65.5
}
```

---

## 🎯 Mission Endpoints

### Create New Mission
```http
POST /api/missions/create/{student_id}
Content-Type: application/json

{
  "title": "Master Math Basics",
  "description": "Solve 10 math problems on fractions and decimals",
  "reward_xp": 75
}

Response 200:
{
  "status": "success",
  "message": "Mission created successfully",
  "mission": {
    "id": 2,
    "title": "Master Math Basics",
    "description": "Solve 10 math problems on fractions and decimals",
    "reward_xp": 75,
    "status": "active",
    "due_date": "2025-12-26T09:23:37.418456"
  }
}
```

### Get Today's Mission
```http
GET /api/missions/today/{student_id}

Response 200 (with mission):
{
  "id": 2,
  "title": "Master Math Basics",
  "description": "Solve 10 math problems on fractions and decimals",
  "reward_xp": 75,
  "status": "active",
  "due_date": "2025-12-26T09:23:37.418456"
}

Response 200 (no mission):
{
  "status": "no_mission",
  "message": "No active mission today"
}
```

### List All Missions
```http
GET /api/missions/list/{student_id}
GET /api/missions/list/{student_id}?status=active

Response 200:
{
  "missions": [
    {
      "id": 2,
      "title": "Master Math Basics",
      "description": "Solve 10 math problems on fractions and decimals",
      "reward_xp": 75,
      "status": "active",
      "created_at": "2025-12-25T09:23:37.419257",
      "due_date": "2025-12-26T09:23:37.418456"
    }
  ],
  "count": 1
}
```

### Complete Mission
```http
POST /api/missions/{mission_id}/complete?student_id=1

Response 200:
{
  "status": "success",
  "message": "Mission completed successfully",
  "xp_awarded": 75,
  "total_xp": 1325
}
```

---

## ❓ Quiz Endpoints

### Get Specific Question
```http
GET /api/quiz/question/{question_id}

Response 200:
{
  "id": 1,
  "concept_id": 5,
  "difficulty": "easy",
  "question_text": "What is 2/3 + 1/3?",
  "options": [
    {"id": 1, "text": "1", "correct": true},
    {"id": 2, "text": "2/3", "correct": false},
    {"id": 3, "text": "3/3", "correct": false},
    {"id": 4, "text": "4/3", "correct": false}
  ],
  "explanation": "When adding fractions with the same denominator..."
}
```

### Get Random Question by Concept
```http
GET /api/quiz/random/{concept_id}
GET /api/quiz/random/{concept_id}?difficulty=hard

Response 200:
{
  "id": 15,
  "concept_id": 5,
  "difficulty": "medium",
  "question_text": "Simplify 12/18",
  "options": [
    {"id": 1, "text": "2/3", "correct": true},
    {"id": 2, "text": "1/2", "correct": false},
    {"id": 3, "text": "3/4", "correct": false},
    {"id": 4, "text": "12/18", "correct": false}
  ],
  "explanation": "Find GCD of 12 and 18..."
}
```

### Submit Answer
```http
POST /api/quiz/submit
Content-Type: application/json

{
  "student_id": 1,
  "question_id": 15,
  "selected_option_id": 1,
  "time_spent_seconds": 45
}

Response 200 (correct):
{
  "is_correct": true,
  "message": "Correct! Great work!",
  "xp_earned": 10,
  "next_difficulty": "hard",
  "streak_count": 6
}

Response 200 (incorrect):
{
  "is_correct": false,
  "message": "Incorrect. Try again!",
  "correct_option_id": 1,
  "explanation": "Find GCD of 12 and 18...",
  "xp_earned": 0,
  "next_difficulty": "easy"
}
```

---

## 📈 Progress Tracking Endpoints

### Get Detailed Progress
```http
GET /api/progress/student/{student_id}

Response 200:
{
  "student_id": 1,
  "total_xp": 1325,
  "daily_progress": [
    {
      "date": "2025-12-25",
      "xp_earned": 150,
      "questions_completed": 12
    }
  ],
  "weekly_stats": {
    "total_xp": 850,
    "streak_days": 5,
    "questions_completed": 75
  },
  "chapter_progress": [
    {
      "chapter_id": 1,
      "name": "Fractions",
      "mastery_score": 78.5,
      "questions_completed": 45,
      "questions_correct": 35
    }
  ]
}
```

---

## ✅ Health & Status Endpoints

### Health Check
```http
GET /health

Response 200:
{
  "status": "ok",
  "message": "Backend is running",
  "environment": "development",
  "debug": true
}
```

### API Documentation
```http
GET /docs

Response: OpenAPI/Swagger UI (interactive documentation)
```

---

## 🔄 Response Formats

### Success Response
```json
{
  "status": "success",
  "data": { },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "status": "error",
  "error": "Invalid request",
  "message": "Detailed error message",
  "code": 400
}
```

### Pagination (for list endpoints)
```json
{
  "items": [ ],
  "count": 10,
  "page": 1,
  "per_page": 10,
  "total": 100
}
```

---

## 🔑 Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET, POST, PUT |
| 201 | Created | Successfully created new resource |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Authenticated but not allowed |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 500 | Server Error | Backend error |

---

## 🔒 Authentication

### Using JWT Token

All authenticated endpoints require:
```http
Authorization: Bearer <token>
```

Example:
```bash
curl -H "Authorization: Bearer eyJ0eXAiOiJKV1Q..." \
  http://localhost:8000/api/student/1/progress
```

### Getting Token
Register or login to get token:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'

# Response includes token
# {"id": 1, "token": "eyJ0eXAiOiJKV1Q...", ...}
```

---

## 🧪 Testing Endpoints

### Using curl
```bash
# Simple GET
curl http://localhost:8000/api/student/1

# POST with data
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "pass"}'

# With authentication
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/student/1/progress
```

### Using Postman
1. Create new request
2. Set URL to `http://localhost:8000/api/...`
3. Select method (GET, POST, etc.)
4. Add headers if needed
5. Add JSON body if needed
6. Click Send

### Using Frontend API Client
```typescript
import { 
  getStudentProgress, 
  saveOnboarding, 
  getTodayMission,
  completeMission 
} from "@/lib/api";

// Usage in React components
const progress = await getStudentProgress(studentId);
const mission = await getTodayMission(studentId);
```

---

## 📊 Common API Patterns

### Fetching Data
```bash
# Get single item
GET /api/student/1

# Get list
GET /api/missions/list/1

# Get list with filter
GET /api/missions/list/1?status=active
```

### Creating Data
```bash
# POST to create
POST /api/missions/create/1
Content-Type: application/json

{
  "title": "...",
  "description": "..."
}
```

### Updating Data
```bash
# POST to complete mission
POST /api/missions/2/complete?student_id=1
```

---

## ⚡ Performance Tips

- **Batch requests:** Combine multiple queries into single endpoint when possible
- **Pagination:** Use limit/offset for large datasets
- **Caching:** Cache frequently accessed data on frontend
- **Lazy loading:** Load data on-demand, not all at once

---

## 🐛 Common Errors & Fixes

### 404 Not Found
**Cause:** Wrong URL or endpoint doesn't exist
**Fix:** Check URL spelling, verify endpoint exists in API_ENDPOINTS.md

### 400 Bad Request
**Cause:** Invalid request format or missing required fields
**Fix:** Check request body format, ensure all required fields present

### 500 Server Error
**Cause:** Backend error during processing
**Fix:** Check backend terminal output for error details, verify database is accessible

---

## 📋 Endpoint Checklist

### Authentication (2)
- [x] Register Student
- [x] Login

### Student Data (4)
- [x] Get Profile
- [x] Get Progress
- [x] Get Streak
- [x] Get Mastery

### Onboarding (2)
- [x] Save Onboarding Data
- [x] Check Status

### Missions (4)
- [x] Create Mission
- [x] Get Today's Mission
- [x] List Missions
- [x] Complete Mission

### Quiz (3)
- [x] Get Question
- [x] Get Random Question
- [x] Submit Answer

### Progress (1)
- [x] Get Detailed Progress

### System (2)
- [x] Health Check
- [x] API Documentation

**Total: 25+ Endpoints**

---

## 🚀 Ready to Use!

All endpoints are fully functional and tested. See `SETUP_&_DEVELOPMENT.md` for setup instructions.

Last updated: December 25, 2025
