# backend/app/schemas/student.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class ChapterProgress(BaseModel):
    """Chapter-level progress"""
    chapter_id: int
    name: str
    mastery_score: float = Field(..., ge=0.0, le=100.0)
    questions_completed: int
    questions_correct: int
    status: str

class ConceptMastery(BaseModel):
    """Concept-level mastery tracking"""
    concept_id: int
    name: str
    mastery_score: float = Field(..., ge=0.0, le=1.0)
    leitner_box: int = Field(..., ge=1, le=4)
    next_review_date: str
    status: str

class StudentResponse(BaseModel):
    """Student profile response"""
    id: int
    user_id: str
    email: str
    name: str
    grade_level: Optional[int]
    total_xp: int
    current_streak: int
    best_streak: int
    avatar_url: Optional[str]
    
    class Config:
        from_attributes = True

class StudentProgressResponse(BaseModel):
    """Student progress response with all chapters"""
    student_id: int
    name: str
    total_xp: int
    current_streak: int
    best_streak: int
    chapters: List[ChapterProgress]
    
    class Config:
        from_attributes = True
