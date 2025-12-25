"""
Onboarding API routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.onboarding_service import OnboardingService
from pydantic import BaseModel

router = APIRouter()


class OnboardingRequest(BaseModel):
    """Onboarding completion request"""
    avatar: str
    goals: dict  # {math: true, science: false}
    baseline_score: float


class OnboardingResponse(BaseModel):
    """Onboarding response"""
    status: str
    message: str
    completed: bool


@router.post("/save")
async def save_onboarding(
    student_id: int,
    request: OnboardingRequest,
    db: Session = Depends(get_db)
):
    """Save onboarding data"""
    response, status_code = OnboardingService.save_onboarding(
        db,
        student_id,
        request.avatar,
        request.goals,
        request.baseline_score
    )
    
    if status_code != 200:
        raise HTTPException(status_code=status_code, detail=response.get("error"))
    
    return response


@router.get("/status/{student_id}")
async def check_status(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Check onboarding status"""
    return OnboardingService.check_onboarding_status(db, student_id)
