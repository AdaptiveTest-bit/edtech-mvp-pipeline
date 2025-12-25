# 📋 INSPECTION CHECKLIST: API Endpoint Mismatch

## Error Details
```
Frontend: Progress tab fails to load
Console: GET /api/student/{studentId}/mastery → 404 Not Found
File: frontend/src/lib/api.ts:357
Function: getStudentMastery(studentId)
Called from: frontend/src/app/progress/page.tsx:35
```

---

## Code Locations

### ❌ Problem File: frontend/src/lib/api.ts

**Line 357:**
```typescript
export async function getStudentMastery(studentId: number): Promise<any> {
  log(`Fetching student mastery: ${studentId}`);
  const response = await fetch(`${API_BASE}/api/student/${studentId}/mastery`);  // ← CALLS MISSING ENDPOINT
  return handleResponse<any>(response);
}
```

**Expected Response Format (lines 7-15 of progress/page.tsx):**
```typescript
interface ConceptMastery {
  concept_id: number;
  concept_name: string;
  mastery_score: number;
  leitner_box: number;
  next_review_date: string;
  status: string;
}

interface MasteryData {
  concepts: ConceptMastery[];
}
```

---

### ✅ What Exists in Backend

#### File: backend/app/services/student_service.py
Lines 58-93: `get_concept_mastery()` method
- Takes: `student_id`, `concept_id`
- Returns: Single concept mastery object
- **Does NOT return all concepts**

#### File: backend/app/api/routes/student.py
Lines 56-68: `get_concept_mastery` endpoint
- Path: `GET /api/student/concept/{concept_id}/mastery`
- Needs `student_id` as parameter (currently looks for it in wrong place)
- **Does NOT have the `/mastery` endpoint on `/{student_id}/mastery` path**

#### File: backend/app/__init__.py
Lines 40-43: Route registration
```python
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(student.router, prefix="/api/student", tags=["student"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
```
- Student router is registered ✓
- But it's missing the `/{student_id}/mastery` endpoint

---

## Investigation Steps

### ✅ CONFIRMED: Missing Endpoint

**Step 1:** Check if endpoint exists
```bash
curl http://localhost:8000/api/student/1/mastery
# Result: 404 Not Found ❌
```

**Step 2:** Check what endpoints DO exist
```bash
curl http://localhost:8000/docs
# View Swagger UI → Check "student" tag
# Available: /{student_id}, /{student_id}/progress, /{student_id}/streak
# Available: /concept/{concept_id}/mastery
# Missing: /{student_id}/mastery ❌
```

**Step 3:** Check StudentMastery model
```bash
grep -n "class StudentMastery" backend/app/models/analytics.py
# Should show fields: user_id (or student_id), concept_id, mastery_score, leitner_box, next_review_date
```

---

## Files That Need Updates

### To Fix: Add Missing Endpoint

**File 1: backend/app/services/student_service.py**
- ADD: `get_all_concepts_mastery(db, student_id)` method
- This method should:
  - Query `StudentMastery` table filtered by `student_id`
  - Join with `Concept` table to get concept names
  - Build response object with array of concepts
  - Handle case where student exists but has no mastery records

**File 2: backend/app/api/routes/student.py**
- ADD: `@router.get("/{student_id}/mastery")` endpoint
- This endpoint should:
  - Accept `student_id` path parameter
  - Call `StudentService.get_all_concepts_mastery(db, student_id)`
  - Return response matching Progress page expectations
  - Handle 404 case appropriately

---

## Expected Database Query

When new endpoint is called with `student_id=1`:

```sql
SELECT 
  sm.concept_id,
  c.name as concept_name,
  sm.mastery_score,
  sm.leitner_box,
  sm.next_review_date
FROM analytics.student_mastery sm
JOIN curriculum.concepts c ON sm.concept_id = c.id
WHERE sm.user_id = 1  -- or sm.student_id = 1 (check StudentMastery model)
ORDER BY sm.concept_id;
```

Should return rows like:
```
concept_id | concept_name | mastery_score | leitner_box | next_review_date
-----------+--------------+---------------+-------------+-------------------
    1      | Addition     |     0.85      |      3      | 2025-01-05
    2      | Subtraction  |     0.72      |      2      | 2025-01-08
    3      | Multiplication | 0.60       |      1      | 2025-01-10
```

---

## Quick Verify: Does Method Exist?

Check if `get_all_concepts_mastery` is already in StudentService:

```bash
grep -n "get_all_concepts_mastery\|get_student_all_mastery\|all_concepts" \
  backend/app/services/student_service.py
```

If returns nothing → Method doesn't exist, needs to be created ❌

---

## Summary Table

| Component | Status | Details |
|-----------|--------|---------|
| Frontend API call | ✅ Correct | `GET /api/student/{id}/mastery` - proper URL format |
| Frontend Response Format | ✅ Correct | Expects `{concepts: [...]}` array |
| Backend Service Method | ❌ Missing | Need `get_all_concepts_mastery()` |
| Backend API Endpoint | ❌ Missing | Need `@router.get("/{student_id}/mastery")` |
| Database | ✅ Has Data | `analytics.student_mastery` has data |

---

## Next Steps (When Ready to Implement)

1. ✅ Inspect StudentMastery model to confirm field names
2. ✅ Check if any similar "get all" methods exist for reference pattern
3. ✅ Create service method using existing `get_concept_mastery()` as reference
4. ✅ Create endpoint in student.py using existing patterns
5. ✅ Test endpoint: `curl http://localhost:8000/api/student/1/mastery`
6. ✅ Reload frontend - Progress tab should work

