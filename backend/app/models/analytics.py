# backend/app/models/analytics.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Float, ForeignKey, UniqueConstraint, Numeric
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from datetime import datetime, date
import uuid

class Attempt(Base):
    """Quiz attempt - individual question attempts with UUID primary key"""
    __tablename__ = "attempts"
    __table_args__ = {"schema": "analytics"}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Integer, ForeignKey("users.students.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("curriculum.questions.id", ondelete="CASCADE"), nullable=False, index=True)
    is_correct = Column(Boolean, nullable=False)
    time_taken_seconds = Column(Integer, nullable=True)
    selected_option = Column(String(10), nullable=True)  # "A", "B", "C", "D"
    attempted_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)

class StudentMastery(Base):
    """Student mastery using Leitner box spaced repetition + EMA algorithm"""
    __tablename__ = "student_mastery"
    __table_args__ = {"schema": "analytics"}
    
    # Composite primary key: (user_id, concept_id)
    user_id = Column(Integer, ForeignKey("users.students.id", ondelete="CASCADE"), nullable=False, primary_key=True)
    concept_id = Column(Integer, ForeignKey("curriculum.concepts.id", ondelete="CASCADE"), nullable=False, primary_key=True)
    mastery_score = Column(Float, nullable=False, default=0.0)  # 0.0 to 1.0 (EMA)
    leitner_box = Column(Integer, nullable=False, default=1)  # 1, 2, 3, or 4
    next_review_date = Column(Date, nullable=False, default=date.today)
    last_practiced_at = Column(DateTime, nullable=False, default=datetime.utcnow)

class QuizSubmission(Base):
    """Quiz submission with XP tracking"""
    __tablename__ = "quiz_submissions"
    __table_args__ = {"schema": "analytics"}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.students.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("curriculum.questions.id", ondelete="CASCADE"), nullable=False, index=True)
    is_correct = Column(Boolean, nullable=False)
    time_taken_seconds = Column(Integer, nullable=True)
    selected_option = Column(String(10), nullable=True)  # "A", "B", "C", "D"
    xp_earned = Column(Integer, nullable=False, default=0)
    submitted_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)

class StudentProgress(Base):
    """Chapter-level mastery tracking"""
    __tablename__ = "student_progress"
    __table_args__ = (
        UniqueConstraint('user_id', 'chapter_id'),
        {"schema": "analytics"}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.students.id", ondelete="CASCADE"), nullable=False, index=True)
    chapter_id = Column(Integer, ForeignKey("curriculum.chapters.id", ondelete="CASCADE"), nullable=False, index=True)
    mastery_score = Column(Numeric(5, 2), nullable=False, default=0)  # 0-100 percentage (NUMERIC for precision)
    questions_completed = Column(Integer, nullable=False, default=0)
    questions_correct = Column(Integer, nullable=False, default=0)
    last_answered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

class DailyAnalytics(Base):
    """Daily activity summary for analytics dashboard"""
    __tablename__ = "daily_analytics"
    __table_args__ = (
        UniqueConstraint('user_id', 'analytics_date'),
        {"schema": "analytics"}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.students.id", ondelete="CASCADE"), nullable=False, index=True)
    analytics_date = Column(Date, nullable=False, index=True)
    questions_answered = Column(Integer, nullable=False, default=0)
    questions_correct = Column(Integer, nullable=False, default=0)
    xp_earned = Column(Integer, nullable=False, default=0)
    time_spent_minutes = Column(Integer, nullable=False, default=0)
    streak_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
