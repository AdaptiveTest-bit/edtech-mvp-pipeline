# backend/app/api/routes/progress.py
"""
Progress tracking API routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.student_service import StudentService

router = APIRouter()

@router.get("/student/{student_id}")
async def get_student_progress_dashboard(
    student_id: int,
    db: Session = Depends(get_db)
):
    """
    Get comprehensive student progress for dashboard
    Includes all chapters and their mastery scores
    """
    progress = StudentService.get_student_progress(db, student_id)
    
    if progress is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return progress
