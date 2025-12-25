"""
Onboarding model for tracking student onboarding status
"""
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, JSON
from datetime import datetime
from app.database import Base


class OnboardingStatus(Base):
    """Student onboarding status tracking"""
    __tablename__ = "onboarding_status"
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, unique=True, nullable=False)
    completed = Column(Boolean, default=False)
    avatar_selected = Column(String(255))
    goals = Column(JSON)  # {math: true, science: false}
    baseline_score = Column(Float, default=0.0)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
