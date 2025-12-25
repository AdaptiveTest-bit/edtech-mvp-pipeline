"""
Mission model for tracking daily tasks and engagement
"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.database import Base


class Mission(Base):
    """Student missions/daily tasks"""
    __tablename__ = "missions"
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    reward_xp = Column(Integer, default=50)
    difficulty_level = Column(Integer, default=1)
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=False)
    completed_at = Column(DateTime)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
