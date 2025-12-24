# backend/app/schemas/quiz.py
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime

class QuestionResponse(BaseModel):
    """Response model for getting a question"""
    id: int
    concept_id: int
    content: Dict[str, Any]
    difficulty_level: int
    explanation: str
    
    class Config:
        from_attributes = True

class SubmitAnswerRequest(BaseModel):
    """Request to submit an answer"""
    question_id: int = Field(..., gt=0)
    student_id: int = Field(..., gt=0)
    selected_option: str = Field(..., min_length=1, max_length=1)
    time_taken_seconds: Optional[int] = Field(None, ge=0)

class QuizFeedback(BaseModel):
    """Feedback for a quiz submission"""
    is_correct: bool
    explanation: str
    concept_id: int
    xp_earned: int

class SubmitAnswerResponse(BaseModel):
    """Response after submitting an answer"""
    is_correct: bool
    xp_earned: int
    explanation: str
    concept_mastery_score: float = Field(..., ge=0.0, le=1.0)
    concept_leitner_box: int = Field(..., ge=1, le=4)
    chapter_mastery_score: float = Field(..., ge=0.0, le=100.0)
    total_xp: int
    next_review_date: str
    
    class Config:
        from_attributes = True
