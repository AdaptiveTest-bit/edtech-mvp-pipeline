"""
Service for onboarding operations
"""
from sqlalchemy.orm import Session
from app.models import OnboardingStatus, Student
from datetime import datetime
from typing import Dict, Any, Tuple


class OnboardingService:
    """Service for onboarding workflows"""
    
    @staticmethod
    def get_or_create_onboarding(db: Session, student_id: int) -> OnboardingStatus:
        """Get existing or create new onboarding record"""
        onboarding = db.query(OnboardingStatus).filter(
            OnboardingStatus.student_id == student_id
        ).first()
        
        if not onboarding:
            onboarding = OnboardingStatus(student_id=student_id)
            db.add(onboarding)
            db.commit()
        
        return onboarding
    
    @staticmethod
    def save_onboarding(
        db: Session,
        student_id: int,
        avatar: str,
        goals: Dict[str, bool],
        baseline_score: float
    ) -> Tuple[Dict[str, Any], int]:
        """Save onboarding data"""
        try:
            onboarding = OnboardingService.get_or_create_onboarding(db, student_id)
            
            onboarding.avatar_selected = avatar
            onboarding.goals = goals
            onboarding.baseline_score = baseline_score
            onboarding.completed = True
            onboarding.completed_at = datetime.utcnow()
            onboarding.updated_at = datetime.utcnow()
            
            db.commit()
            
            # Update student to mark onboarding as done
            student = db.query(Student).filter(Student.id == student_id).first()
            if student:
                # Optional: Add onboarding flag to student (if we want to track there)
                pass
            
            return {
                "status": "success",
                "message": "Onboarding completed",
                "completed": True
            }, 200
            
        except Exception as e:
            db.rollback()
            return {"error": str(e)}, 500
    
    @staticmethod
    def check_onboarding_status(db: Session, student_id: int) -> Dict[str, Any]:
        """Check if student has completed onboarding"""
        onboarding = db.query(OnboardingStatus).filter(
            OnboardingStatus.student_id == student_id
        ).first()
        
        if not onboarding:
            return {
                "student_id": student_id,
                "completed": False,
                "status": "not_started"
            }
        
        return {
            "student_id": student_id,
            "completed": onboarding.completed,
            "avatar": onboarding.avatar_selected,
            "baseline_score": onboarding.baseline_score,
            "completed_at": onboarding.completed_at.isoformat() if onboarding.completed_at else None
        }
