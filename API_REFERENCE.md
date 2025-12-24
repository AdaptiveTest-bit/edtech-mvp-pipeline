# 📡 API Reference

Complete guide to all EdTech MVP API endpoints with request/response examples.

---

## 🔑 Authentication

All endpoints except auth require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

---

## 📋 Endpoints

### Auth Endpoints

#### POST `/api/auth/register`
Create new student account.

**Request:**
```json
{
  "email": "newstudent@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "newstudent@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Errors:**
- `400 Bad Request` - Invalid email format or password too weak
- `409 Conflict` - Email already registered

---

#### POST `/api/auth/login`
Authenticate and receive JWT token.

**Request:**
```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "student": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@example.com",
    "first_name": "Alice",
    "last_name": "Smith"
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid email or password
- `404 Not Found` - Student account doesn't exist

---

### Quiz Endpoints

#### GET `/api/quiz/random/{concept_id}`
Get random question for a specific concept.

**Path Parameters:**
- `concept_id` (integer) - ID of the concept

**Query Parameters (Optional):**
- `difficulty` (integer, 1-2) - Filter by difficulty level

**Response (200 OK):**
```json
{
  "id": 1,
  "concept_id": 1,
  "question_text": "What is a variable in programming?",
  "option_a": "A container for storing data values",
  "option_b": "A type of function",
  "option_c": "A loop structure",
  "option_d": "A class definition",
  "difficulty": 1,
  "explanation": "Variables are containers for storing data values."
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Concept doesn't exist or no questions available

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/quiz/random/1
```

---

#### GET `/api/quiz/question/{id}`
Get specific question by ID.

**Path Parameters:**
- `id` (integer) - Question ID

**Response (200 OK):**
```json
{
  "id": 5,
  "concept_id": 2,
  "question_text": "What is a loop?",
  "option_a": "A repeated statement",
  "option_b": "A function call",
  "option_c": "A variable",
  "option_d": "A class method",
  "difficulty": 1,
  "explanation": "A loop repeats a block of code multiple times."
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Question doesn't exist

---

#### POST `/api/quiz/submit`
Submit answer and update mastery score.

**Request:**
```json
{
  "student_id": "550e8400-e29b-41d4-a716-446655440000",
  "question_id": 1,
  "selected_option": "A"
}
```

**Response (200 OK):**
```json
{
  "is_correct": true,
  "explanation": "Correct! Variables are containers for storing data values.",
  "new_mastery_score": 0.65,
  "xp_gained": 10,
  "leitner_box": 2,
  "next_review": "2024-01-18"
}
```

**Errors:**
- `400 Bad Request` - Invalid option (must be A, B, C, or D)
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Student or question doesn't exist

**Note:** Mastery score is updated using EMA formula (0.0-1.0 scale)

---

### Progress Endpoints

#### GET `/api/student/{id}/progress`
Get chapter-level progress for a student.

**Path Parameters:**
- `id` (UUID) - Student ID

**Response (200 OK):**
```json
[
  {
    "chapter_id": 1,
    "chapter_name": "Programming Basics",
    "mastery_percentage": 75,
    "concept_count": 5,
    "mastered_count": 4,
    "concepts": [
      {
        "concept_id": 1,
        "concept_name": "Variables",
        "mastery_score": 0.85
      }
    ]
  },
  {
    "chapter_id": 2,
    "chapter_name": "Control Flow",
    "mastery_percentage": 45,
    "concept_count": 4,
    "mastered_count": 2,
    "concepts": [
      {
        "concept_id": 5,
        "concept_name": "If Statements",
        "mastery_score": 0.60
      }
    ]
  }
]
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Student doesn't exist

---

#### GET `/api/student/{id}/streak`
Get streak information for a student.

**Path Parameters:**
- `id` (UUID) - Student ID

**Response (200 OK):**
```json
{
  "student_id": "550e8400-e29b-41d4-a716-446655440000",
  "current_streak": 7,
  "best_streak": 14,
  "last_activity": "2024-01-15T14:30:00Z",
  "total_xp": 450,
  "xp_today": 50
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Student doesn't exist

---

#### GET `/api/progress/student/{id}`
Get concept-level mastery details for a student.

**Path Parameters:**
- `id` (UUID) - Student ID

**Response (200 OK):**
```json
[
  {
    "concept_id": 1,
    "concept_name": "Variables",
    "chapter_name": "Programming Basics",
    "mastery_score": 0.85,
    "leitner_box": 3,
    "attempts": 8,
    "correct_attempts": 7,
    "last_reviewed": "2024-01-15T14:30:00Z",
    "next_review": "2024-01-22",
    "review_status": "due"
  },
  {
    "concept_id": 2,
    "concept_name": "Data Types",
    "chapter_name": "Programming Basics",
    "mastery_score": 0.65,
    "leitner_box": 2,
    "attempts": 5,
    "correct_attempts": 3,
    "last_reviewed": "2024-01-14T10:15:00Z",
    "next_review": "2024-01-17",
    "review_status": "pending"
  }
]
```

**Mastery Score Interpretation:**
- `0.0 - 0.3`: Just learning
- `0.3 - 0.6`: Making progress
- `0.6 - 0.85`: Getting proficient
- `0.85 - 1.0`: Mastered

**Leitner Box Values:**
- `1`: Needs reinforcement
- `2`: Building confidence
- `3`: Strong understanding
- `4`: Mastered (review less often)

**Review Status:**
- `overdue`: Should review immediately
- `due`: Ready to review
- `pending`: Will be due soon

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Student doesn't exist

---

## 🔄 Response Formats

### Success Response (200 OK)
```json
{
  "data": {...}
}
```

### Error Response
```json
{
  "detail": "Error message describing what went wrong"
}
```

**Common Status Codes:**
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## 🔐 Authentication Token

### Token Structure
JWT token includes:
```json
{
  "sub": "student_id",
  "email": "student@example.com",
  "exp": 1705324800
}
```

### Token Lifetime
- **Validity:** 30 days from issuance
- **Refresh:** Not currently implemented (get new token via login)
- **Storage:** localStorage in browser (frontend handles)

### Adding Token to Requests
```javascript
const response = await fetch('http://localhost:8000/api/quiz/random/1', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 📊 Sample Data Available

### Chapters (5 total)
1. Programming Basics
2. Control Flow
3. Functions & Scope
4. Data Structures
5. Advanced Topics

### Concepts (17 total)
- Chapter 1: Variables, Data Types, Operators, Input/Output, Comments
- Chapter 2: If Statements, Loops, Break/Continue, Conditionals, Nested Logic
- Chapter 3: Function Definition, Parameters, Return Values, Scope, Recursion
- (And more...)

### Questions (33 total)
- Difficulty 1: 18 questions
- Difficulty 2: 15 questions
- Distributed across all concepts

### Sample Students (5 total)
All with password `password123`:
- alice@example.com
- bob@example.com
- charlie@example.com
- diana@example.com
- eve@example.com

---

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

### Get Random Question
```bash
TOKEN="<your_token_here>"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/quiz/random/1
```

### Submit Answer
```bash
TOKEN="<your_token_here>"
STUDENT_ID="<student_id>"
curl -X POST http://localhost:8000/api/quiz/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "'$STUDENT_ID'",
    "question_id": 1,
    "selected_option": "A"
  }'
```

### Get Progress
```bash
TOKEN="<your_token_here>"
STUDENT_ID="<student_id>"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/student/$STUDENT_ID/progress
```

---

## 🔗 Base URL

**Development:**
```
http://localhost:8000
```

**Production:**
```
https://api.edtech-mvp.com
```

---

## 📖 API Documentation

**Interactive API Docs (Swagger UI):**
```
http://localhost:8000/docs
```

**Alternative API Docs (ReDoc):**
```
http://localhost:8000/redoc
```

---

**Last Updated:** January 2024  
**API Version:** 1.0
