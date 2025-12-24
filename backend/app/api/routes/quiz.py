# backend/app/api/routes/quiz.py
"""
Quiz API routes for submitting answers and getting questions
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.quiz_service import QuizService
from app.schemas.quiz import (
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    QuestionResponse
)

router = APIRouter()

@router.post("/submit", response_model=SubmitAnswerResponse)
async def submit_answer(
    request: SubmitAnswerRequest,
    db: Session = Depends(get_db)
):
    """
    Submit an answer to a question
    
    Updates:
    - Student XP
    - Concept mastery (Leitner box + EMA)
    - Chapter progress
    - Attempt records
    """
    response, status_code = QuizService.submit_answer(
        db,
        request.student_id,
        request.question_id,
        request.selected_option,
        request.time_taken_seconds
    )
    
    if status_code != 200:
        raise HTTPException(status_code=status_code, detail=response.get("error"))
    
    return response

@router.get("/question/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific question by ID"""
    question = QuizService.get_question(db, question_id)
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return question

@router.get("/random/{concept_id}", response_model=QuestionResponse)
async def get_random_question(
    concept_id: int,
    difficulty: int = None,
    db: Session = Depends(get_db)
):
    """Get random question from concept (for spaced repetition)"""
    question = QuizService.get_random_question(db, concept_id, difficulty)
    
    if not question:
        raise HTTPException(status_code=404, detail="No questions found for this concept")
    
    return question
