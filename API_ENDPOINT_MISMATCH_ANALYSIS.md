# 🔍 API Endpoint Mismatch Analysis

## Problem Summary

The frontend is calling `/api/student/{studentId}/mastery` which **does not exist** in the backend, causing **404 Not Found** errors when trying to load the progress tab.

---

## Current State

### Frontend Call (api.ts:357)
```typescript
export async function getStudentMastery(studentId: number): Promise<any> {
  const response = await fetch(`${API_BASE}/api/student/${studentId}/mastery`);
  return handleResponse<any>(response);
}
```

**URL Called:** `GET /api/student/{studentId}/mastery`

**Expected Response Format:**
```json
{
  "concepts": [
    {
      "concept_id": 1,
      "concept_name": "Addition",
      "mastery_score": 0.85,
      "leitner_box": 3,
      "next_review_date": "2025-01-05T00:00:00",
      "status": "reviewing"
    }
  ]
}
```

---

## Backend Available Endpoints

### Registered Routes (app/__init__.py)
```python
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(student.router, prefix="/api/student", tags=["student"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
```

### Student Routes (app/api/routes/student.py)
✅ Existing endpoints:
- `GET /api/student/{student_id}` → Get student profile
- `GET /api/student/{student_id}/progress` → Get student progress
- `GET /api/student/{student_id}/streak` → Get streak info
- `GET /api/student/concept/{concept_id}/mastery` → Get specific concept mastery

❌ **Missing:**
- `GET /api/student/{student_id}/mastery` → Get all concepts mastery (THIS IS WHAT'S BEING CALLED)

### Progress Routes (app/api/routes/progress.py)
Need to check what endpoints are available here.

---

## Root Cause

**The endpoint `/api/student/{student_id}/mastery` was never implemented in the backend.**

The backend has:
- Individual endpoints for concept mastery
- Progress endpoints (in progress.py)

But **NOT** a single endpoint that returns all mastery data for all concepts.

---

## Solution Options

### Option 1: Create Missing Backend Endpoint (RECOMMENDED)
**File:** `backend/app/api/routes/student.py`

Add new endpoint:
```python
@router.get("/{student_id}/mastery")
async def get_all_student_mastery(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Get student mastery for all concepts"""
    # Query analytics.student_mastery for this student
    # Return aggregated mastery data
    # Return format should match frontend expectations
```

**What it needs to do:**
1. Query `analytics.student_mastery` table for all concepts where `student_id = student_id`
2. Join with `curriculum.concepts` to get concept names
3. Return array of concepts with mastery scores, Leitner boxes, and review dates
4. Match the response format expected by frontend

### Option 2: Change Frontend to Use Existing Endpoint
Change `api.ts` to call `/api/student/{studentId}/progress` instead, which already exists.

**Risk:** This endpoint might not have the detailed concept-by-concept breakdown needed.

---

## Frontend Expectations

The Progress page expects response with this structure:
```typescript
interface MasteryData {
  concepts: ConceptMastery[];
}

interface ConceptMastery {
  concept_id: number;
  concept_name: string;
  mastery_score: number;        // 0-1 (decimal percentage)
  leitner_box: number;          // 1-4
  next_review_date: string;     // ISO date string
  status: string;               // "reviewing", "mastered", etc.
}
```

---

## Database Tables Involved

**Source:** `analytics.student_mastery`
- `student_id` - FK to students
- `concept_id` - FK to concepts
- `mastery_score` - EMA (exponential moving average)
- `leitner_box` - Current spaced repetition box (1-4)
- `last_reviewed` - Last review timestamp
- `next_review_date` - When to review next

**Join:** `curriculum.concepts`
- `concept_id`
- `name`

---

## Impact

**Severity:** 🔴 **CRITICAL**
- Progress tab completely broken (404 errors)
- User cannot view their learning progress
- Multiple API calls failing (404 appears 3+ times in console)

**Affected Component:**
- `frontend/src/app/progress/page.tsx` (Progress Tab)

**Blocked User Actions:**
- Cannot view mastery scores
- Cannot see Leitner boxes
- Cannot check next review dates

---

## Recommendation

**Create the missing backend endpoint** (`GET /api/student/{student_id}/mastery`) 

This is the cleanest solution because:
1. ✅ Frontend code is correct and expects this endpoint
2. ✅ API naming is consistent (student mastery endpoint in student router)
3. ✅ Response format matches database structure
4. ✅ Follows existing endpoint patterns
5. ✅ Backend service method likely already exists

---

## Implementation Status

### Service Layer (app/services/student_service.py)
✅ Has `get_concept_mastery(student_id, concept_id)` - Gets ONE concept
✅ Has `get_student_progress(student_id)` - Gets chapter-level progress
❌ **Missing:** `get_all_concepts_mastery(student_id)` - Gets ALL concepts mastery

### API Layer (app/api/routes/student.py)
✅ Has `get_concept_mastery` endpoint - Gets ONE concept
✅ Has `get_student_progress` endpoint - Gets chapters
❌ **Missing:** `get_all_student_mastery` endpoint - Gets ALL concepts

---

## Quick Implementation Path

### Step 1: Add Service Method
Add to `StudentService` in `app/services/student_service.py`:
```python
@staticmethod
def get_all_concepts_mastery(
    db: Session,
    student_id: int
) -> Dict[str, Any]:
    """Get mastery for ALL concepts that student has attempted"""
    # Query all StudentMastery records for this student
    # Join with Concept to get concept names
    # Return array of concept mastery objects
```

### Step 2: Add API Endpoint
Add to `app/api/routes/student.py`:
```python
@router.get("/{student_id}/mastery")
async def get_all_student_mastery(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Get mastery for all concepts"""
    mastery_data = StudentService.get_all_concepts_mastery(db, student_id)
    if mastery_data is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return mastery_data
```

### Step 3: Test
```bash
curl http://localhost:8000/api/student/1/mastery
```

Expected Response:
```json
{
  "concepts": [
    {
      "concept_id": 1,
      "concept_name": "Addition",
      "mastery_score": 0.85,
      "leitner_box": 3,
      "next_review_date": "2025-01-05",
      "status": "reviewing"
    }
  ]
}
```

---

## Error Messages Seen

```
[Error] Error: API Error 404: {"detail":"Not Found"}
Failed to load resource: the server responded with a status of 404 (Not Found) (mastery)
failed to load progress tab.
```

All pointing to same root cause: Missing endpoint.

