# backend/app/schemas/__init__.py
from app.schemas.quiz import (
    QuestionResponse,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    QuizFeedback
)
from app.schemas.student import (
    StudentResponse,
    StudentProgressResponse,
    ChapterProgress,
    ConceptMastery
)
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    AuthResponse
)

__all__ = [
    "QuestionResponse",
    "SubmitAnswerRequest",
    "SubmitAnswerResponse",
    "QuizFeedback",
    "StudentResponse",
    "StudentProgressResponse",
    "ChapterProgress",
    "ConceptMastery",
    "LoginRequest",
    "RegisterRequest",
    "AuthResponse",
]
