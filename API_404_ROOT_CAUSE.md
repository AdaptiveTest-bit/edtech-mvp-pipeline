# 🔴 ROOT CAUSE ANALYSIS: 404 Errors in Progress Tab

## Problem
Frontend calls `/api/student/{studentId}/mastery` → Backend returns **404 Not Found**

## Why
This endpoint was **never implemented** in the backend.

---

## What Currently Exists

### Backend Services ✅
- `StudentService.get_concept_mastery(student_id, concept_id)` 
  - Returns mastery for **ONE** concept
  - Works great for individual concept lookup

- `StudentService.get_student_progress(student_id)`
  - Returns **chapter-level** progress
  - Not detailed enough for concepts

### Backend Endpoints ✅
- `GET /api/student/{student_id}` - Profile
- `GET /api/student/{student_id}/progress` - Chapter progress
- `GET /api/student/{student_id}/streak` - Streak info
- `GET /api/student/concept/{concept_id}/mastery` - Single concept mastery

---

## What's Missing ❌

### Backend Needs
```
GET /api/student/{student_id}/mastery
```

This should return **ALL concepts** the student has mastery data for, in a single response.

### Frontend Expects
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
    },
    {
      "concept_id": 2,
      "concept_name": "Subtraction",
      "mastery_score": 0.72,
      "leitner_box": 2,
      "next_review_date": "2025-01-08T00:00:00",
      "status": "reviewing"
    }
  ]
}
```

---

## Impact on User

❌ **Progress Tab**: Completely broken - Shows 404 errors in console
❌ **Spaced Repetition View**: Cannot see Leitner boxes (1-4)
❌ **Review Schedule**: Cannot see next review dates
❌ **Learning Progress**: Cannot see mastery scores per concept

---

## Solution

Need to create **ONE** new function pair:

### 1. Service Method (backend/app/services/student_service.py)
```python
@staticmethod
def get_all_concepts_mastery(db: Session, student_id: int) -> Dict[str, Any]:
    """
    Get mastery for ALL concepts that student has attempted
    
    Queries analytics.student_mastery for all student attempts
    Joins with curriculum.concepts for concept names
    Returns aggregated mastery data
    """
    # Get all StudentMastery records for this student
    mastery_records = db.query(StudentMastery, Concept).join(
        Concept, StudentMastery.concept_id == Concept.id
    ).filter(
        StudentMastery.user_id == student_id
    ).all()
    
    concepts = []
    for mastery, concept in mastery_records:
        concepts.append({
            "concept_id": mastery.concept_id,
            "concept_name": concept.name,
            "mastery_score": float(mastery.mastery_score),
            "leitner_box": mastery.leitner_box,
            "next_review_date": mastery.next_review_date.isoformat(),
            "status": "reviewing"  # Can be enhanced with logic
        })
    
    return {
        "concepts": concepts
    }
```

### 2. API Endpoint (backend/app/api/routes/student.py)
```python
@router.get("/{student_id}/mastery")
async def get_all_student_mastery(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Get mastery for all concepts student has attempted"""
    mastery_data = StudentService.get_all_concepts_mastery(db, student_id)
    if not mastery_data["concepts"]:
        raise HTTPException(status_code=404, detail="Student not found or no mastery data")
    return mastery_data
```

---

## Testing

Once implemented:

```bash
# Test endpoint
curl http://localhost:8000/api/student/1/mastery

# Expected: 200 OK with concept mastery array
# Progress tab should load without 404 errors
```

---

## Notes

- **user_id** vs **id** in StudentMastery: Check which field is used (based on models)
- **status** field: May need logic to determine "reviewing" vs "mastered" based on date
- **Return format**: Must match Progress page expectations exactly
- **Empty case**: Handle students with no mastery data gracefully

