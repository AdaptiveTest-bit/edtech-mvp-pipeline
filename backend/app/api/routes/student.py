# backend/app/api/routes/student.py
"""
Student API routes for progress and mastery tracking
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.student_service import StudentService
from app.schemas.student import (
    StudentResponse,
    StudentProgressResponse,
    ConceptMastery
)

router = APIRouter()

@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Get student profile"""
    student = StudentService.get_student(db, student_id)
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return student

@router.get("/{student_id}/progress", response_model=StudentProgressResponse)
async def get_student_progress(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Get student progress across all chapters"""
    progress = StudentService.get_student_progress(db, student_id)
    
    if progress is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return progress

@router.get("/{student_id}/streak")
async def get_student_streak(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Get student streak information"""
    streak = StudentService.get_student_streak(db, student_id)
    
    if streak is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return streak

@router.get("/concept/{concept_id}/mastery", response_model=ConceptMastery)
async def get_concept_mastery(
    student_id: int,
    concept_id: int,
    db: Session = Depends(get_db)
):
    """Get concept-level mastery for a student"""
    mastery = StudentService.get_concept_mastery(db, student_id, concept_id)
    
    if mastery is None:
        raise HTTPException(status_code=404, detail="Concept not found")
    
    return mastery
