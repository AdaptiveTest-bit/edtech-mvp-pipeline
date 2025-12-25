# 📊 Visual Analysis: API Endpoint Mismatch

## Architecture Diagram: Current State

```
FRONTEND (http://localhost:3001)
│
└─→ Progress Tab Component
    └─→ useEffect() calls getStudentMastery(student.id)
        └─→ Calls API function: api.ts:357
            │
            └─→ fetch("http://localhost:8000/api/student/1/mastery")
                │
                ├─ Request Type: GET
                ├─ Headers: Content-Type: application/json
                ├─ Payload: None (GET request)
                └─ Expected Response: { concepts: [...] }
                    │
                    └─→ BACKEND (http://localhost:8000)
                        │
                        ├─ Route: /api/student
                        │  Prefix: /api/student
                        │  Full Path: /api/student/1/mastery
                        │
                        ├─ ✓ Endpoint exists? NO ❌
                        │  Available:
                        │  ✓ GET /api/student/{id}
                        │  ✓ GET /api/student/{id}/progress
                        │  ✓ GET /api/student/{id}/streak
                        │  ✓ GET /api/student/concept/{id}/mastery
                        │  ✗ GET /api/student/{id}/mastery  ← MISSING
                        │
                        └─ Returns: 404 Not Found ❌
                            │
                            └─→ Frontend catches error
                                └─→ setError("Failed to load progress")
                                    └─→ Progress Tab shows error ❌

```

---

## Data Flow: What Should Happen

```
FRONTEND REQUEST
│
├─ Component: Progress Page
├─ Function: getStudentMastery(1)
├─ URL: GET /api/student/1/mastery
└─ Headers: {"Content-Type": "application/json"}
    │
    ↓
BACKEND PROCESSING (MISSING - NEEDS TO BE CREATED)
│
├─ Router: student.router
├─ Path: /{student_id}/mastery
├─ Handler: async def get_all_student_mastery(student_id)
│   │
│   ├─ Query: SELECT * FROM analytics.student_mastery WHERE user_id = 1
│   ├─ Join: WITH curriculum.concepts ON concept_id
│   ├─ Process: Format each row into ConceptMastery object
│   ├─ Build: {"concepts": [mastery1, mastery2, ...]}
│   └─ Return: 200 OK + JSON response
│       │
│       └─→ RESPONSE DATA
│           │
│           ├─ Status: 200
│           ├─ Headers: Content-Type: application/json
│           └─ Body:
│               {
│                 "concepts": [
│                   {
│                     "concept_id": 1,
│                     "concept_name": "Addition",
│                     "mastery_score": 0.85,
│                     "leitner_box": 3,
│                     "next_review_date": "2025-01-05T00:00:00",
│                     "status": "reviewing"
│                   },
│                   {
│                     "concept_id": 2,
│                     "concept_name": "Subtraction",
│                     "mastery_score": 0.72,
│                     "leitner_box": 2,
│                     "next_review_date": "2025-01-08T00:00:00",
│                     "status": "reviewing"
│                   }
│                 ]
│               }
│
↓
FRONTEND RESPONSE HANDLING
│
├─ Receives: 200 OK ✓
├─ Parses: JSON response
├─ Validates: Matches MasteryData interface
├─ Stores: setData(masteryData)
├─ Renders: Progress components with data ✓
└─ User sees: Mastery scores, Leitner boxes, Review dates ✓

```

---

## Comparison: What Exists vs What's Missing

### Endpoint 1: Single Concept Mastery ✅ (WORKS)

```
Frontend: ?
         ↓
Backend:  GET /api/student/concept/{conceptId}/mastery
         ├─ Takes: student_id (query param?), concept_id (path param)
         ├─ Returns: Single ConceptMastery object
         └─ Status: 200 OK ✓

Frontend: Progress page?
         └─→ Does NOT call this - too narrow scope
```

### Endpoint 2: Student Progress ✅ (WORKS)

```
Frontend: Dashboard?
         ↓
Backend:  GET /api/student/{studentId}/progress
         ├─ Takes: student_id (path param)
         ├─ Returns: {student_id, name, email, chapters: [...]}
         ├─ Scope: Chapter-level mastery
         └─ Status: 200 OK ✓

Frontend: Progress page?
         └─→ Does NOT call this - wrong structure
             (chapters vs concepts, different response format)
```

### Endpoint 3: All Concepts Mastery ❌ (MISSING)

```
Frontend: GET /api/student/{studentId}/mastery
         ↓
Backend:  ??? DOES NOT EXIST ???
         └─ Status: 404 Not Found ❌

Expected:
         ├─ Takes: student_id (path param)
         ├─ Returns: {concepts: [...]}
         ├─ Scope: All concepts student has attempted
         └─ Status: 200 OK ✓ (IF IT EXISTED)
```

---

## Database: Data Exists ✓

```
PostgreSQL: edtech_mvp

Table: analytics.student_mastery
┌─────────────┬──────────────┬────────────────┬──────────────┬──────────────────┐
│ student_id  │ concept_id   │ mastery_score  │ leitner_box  │ next_review_date │
├─────────────┼──────────────┼────────────────┼──────────────┼──────────────────┤
│ 1           │ 1            │ 0.85           │ 3            │ 2025-01-05       │
│ 1           │ 2            │ 0.72           │ 2            │ 2025-01-08       │
│ 1           │ 3            │ 0.60           │ 1            │ 2025-01-10       │
│ 1           │ 4            │ 0.90           │ 4            │ 2025-02-01       │
└─────────────┴──────────────┴────────────────┴──────────────┴──────────────────┘

Table: curriculum.concepts
┌────┬──────────────┬─────────────────────────┐
│ id │ name         │ description             │
├────┼──────────────┼─────────────────────────┤
│ 1  │ Addition     │ Basic addition...       │
│ 2  │ Subtraction  │ Basic subtraction...    │
│ 3  │ Multiplication│ Times tables...        │
│ 4  │ Division     │ Basic division...       │
└────┴──────────────┴─────────────────────────┘

SQL to get needed data:
┌──────────────────────────────────────────────────────────────────┐
│ SELECT sm.*, c.name                                              │
│ FROM analytics.student_mastery sm                                │
│ JOIN curriculum.concepts c ON sm.concept_id = c.id              │
│ WHERE sm.student_id = 1                                          │
└──────────────────────────────────────────────────────────────────┘
         ↓
   Returns: 4 rows with all needed data
   Data is READY to serve ✓

The only thing missing:
   ❌ No endpoint to expose this data via HTTP
```

---

## Class Diagram: Service Layer

```
StudentService (backend/app/services/student_service.py)
│
├─ ✓ get_student(db, student_id)
│  └─ Returns: Student object
│
├─ ✓ get_student_progress(db, student_id)
│  └─ Returns: {chapters: [...], stats: ...}
│
├─ ✓ get_student_streak(db, student_id)
│  └─ Returns: {current_streak, best_streak, ...}
│
├─ ✓ get_concept_mastery(db, student_id, concept_id)
│  └─ Returns: Single ConceptMastery object
│
└─ ❌ get_all_concepts_mastery(db, student_id)  ← MISSING
   └─ Should Return: {concepts: [ConceptMastery, ...]}
```

---

## Endpoint Structure: Current vs Needed

### Current Routes
```
@router.get("/{student_id}")                  ✓
@router.get("/{student_id}/progress")         ✓
@router.get("/{student_id}/streak")           ✓
@router.get("/concept/{concept_id}/mastery")  ✓
```

### Needed
```
@router.get("/{student_id}/mastery")          ❌
```

---

## Summary Table

```
┌─────────────────┬──────────────┬──────────────┬──────────────────┐
│ Component       │ Status       │ Issue        │ Impact           │
├─────────────────┼──────────────┼──────────────┼──────────────────┤
│ Database Schema │ ✅ Complete  │ None         │ All data exists  │
│ Sample Data     │ ✅ Loaded    │ None         │ 5 students, 33Qs │
│ Frontend Code   │ ✅ Correct   │ None         │ Calls right URL  │
│ Service Method  │ ❌ Missing   │ No bulk get  │ Can't fetch all  │
│ API Endpoint    │ ❌ Missing   │ No route     │ Returns 404      │
│ Response Format │ ❌ Undefined │ Unknown type │ Frontend confused│
└─────────────────┴──────────────┴──────────────┴──────────────────┘
```

---

## Fix Complexity

```
Difficulty Level: 🟢 EASY (GREEN)

Why?
├─ ✅ Pattern already exists (see get_concept_mastery)
├─ ✅ Data already in database
├─ ✅ Data structure simple (array of objects)
├─ ✅ No complex business logic
└─ ✅ Can copy/modify existing similar endpoint

Time estimate: 5-10 minutes
Lines of code: ~30-40 lines
Files to change: 1-2 files
```

