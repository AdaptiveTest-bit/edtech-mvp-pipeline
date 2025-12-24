# backend/app/services/mastery_service.py
"""
Mastery calculation service implementing Leitner box spaced repetition and EMA
"""
from sqlalchemy.orm import Session
from app.models import StudentMastery, Concept
from datetime import datetime, date, timedelta

class MasteryService:
    """Service for calculating and updating mastery scores"""
    
    @staticmethod
    def calculate_ema(old_score: float, new_score: float, alpha: float = 0.3) -> float:
        """
        Calculate Exponential Moving Average
        Formula: new_ema = alpha * new_score + (1 - alpha) * old_score
        
        Args:
            old_score: Previous mastery score (0.0 to 1.0)
            new_score: New attempt score (0.0 or 1.0)
            alpha: Smoothing factor (default 0.3)
        
        Returns:
            Updated mastery score (0.0 to 1.0)
        """
        return round(alpha * new_score + (1 - alpha) * old_score, 3)
    
    @staticmethod
    def get_leitner_review_days(box: int) -> int:
        """
        Get next review date based on Leitner box
        
        Box 1: 1 day
        Box 2: 3 days
        Box 3: 7 days
        Box 4: 14 days (mastered)
        """
        leitner_schedule = {
            1: 1,
            2: 3,
            3: 7,
            4: 14
        }
        return leitner_schedule.get(box, 1)
    
    @staticmethod
    def update_leitner_box(
        current_box: int,
        is_correct: bool
    ) -> int:
        """
        Update Leitner box based on correctness
        
        Args:
            current_box: Current box (1-4)
            is_correct: Whether answer was correct
        
        Returns:
            Updated box (1-4)
        """
        if is_correct:
            # Correct: move forward (max 4)
            return min(current_box + 1, 4)
        else:
            # Wrong: move back to box 1
            return 1
    
    @staticmethod
    def get_or_create_mastery(
        db: Session,
        user_id: int,
        concept_id: int
    ) -> StudentMastery:
        """Get or create mastery record for student + concept"""
        mastery = db.query(StudentMastery).filter(
            StudentMastery.user_id == user_id,
            StudentMastery.concept_id == concept_id
        ).first()
        
        if not mastery:
            mastery = StudentMastery(
                user_id=user_id,
                concept_id=concept_id,
                mastery_score=0.0,
                leitner_box=1,
                next_review_date=date.today(),
                last_practiced_at=datetime.utcnow()
            )
            db.add(mastery)
        
        return mastery
    
    @staticmethod
    def update_mastery_score(
        db: Session,
        user_id: int,
        concept_id: int,
        is_correct: bool
    ) -> StudentMastery:
        """
        Update mastery score for a concept
        Implements: Leitner box + EMA calculation
        """
        mastery = MasteryService.get_or_create_mastery(db, user_id, concept_id)
        
        # Calculate new EMA score
        new_score = 1.0 if is_correct else 0.0
        mastery.mastery_score = MasteryService.calculate_ema(
            mastery.mastery_score,
            new_score
        )
        
        # Update Leitner box
        mastery.leitner_box = MasteryService.update_leitner_box(
            mastery.leitner_box,
            is_correct
        )
        
        # Calculate next review date
        days_until_review = MasteryService.get_leitner_review_days(mastery.leitner_box)
        mastery.next_review_date = date.today() + timedelta(days=days_until_review)
        
        # Update last practiced time
        mastery.last_practiced_at = datetime.utcnow()
        
        return mastery
