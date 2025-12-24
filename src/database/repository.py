# db/models/curriculum.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Index, DateTime
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from src.database.services import Base


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String(100), nullable=False)
    order = Column(Integer, nullable=True)
    is_locked = Column(sa.Boolean(), server_default=sa.text('TRUE'), nullable=False)
    unlock_xp_required = Column(Integer, server_default=sa.text('0'), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # one to many relationship with Topic
    topics = relationship("Topic", back_populates="chapter", cascade="all, delete")


class Topic(Base):
    __tablename__ = "topics"
    # __table_args__ = {"schema": "curriculum"}

    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(
        String(50), ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String(255), nullable=False)
    description = Column(Text)

    # many to one relationship with Topic
    chapter = relationship("Chapter", back_populates="topics")
    # one to many relationship with Question

    concepts = relationship("Concept", back_populates="topic", cascade="all, delete")


class Concept(Base):
    __tablename__ = "concepts"
    # __table_args__ = {"schema": "curriculum"}

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(
        Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False
    )  # Foreign key ensures topic is always linked to a chapter

    name = Column(String(255), nullable=False)
    misconception_guide = Column(Text)
    # many to one relationship with Topic
    topic = relationship("Topic", back_populates="concepts")

    #   one to many relationship with Question
    questions = relationship(
        "Question", back_populates="concept", cascade="all, delete"
    )


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    quiz_id = Column(String(255), unique=True, nullable=False)
    chapter_id = Column(String(50), ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSONB, nullable=False)
    correct_answer_index = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    difficulty_level = Column(String(20), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # relationship back to Chapter if needed
    chapter = relationship("Chapter", backref="questions")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=False)
    phone = Column(String(15))
    email = Column(String(255), unique=True, nullable=False)
    gender = Column(String(10))
    standard = Column(String(20))
    enrollment_date = Column(DateTime, server_default=func.now())
    password_hash = Column(String(255), nullable=False)

    parent = relationship(
        "Parent",
        back_populates="student",
        uselist=False,
        cascade="all, delete"
    )


class Parent(Base):
    __tablename__ = "parents"

    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    phone = Column(String(15))
    email = Column(String(100))

    student_id = Column(
        Integer,
        ForeignKey("students.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    student = relationship("Student", back_populates="parent")


class QuizSubmission(Base):
    __tablename__ = "quiz_submissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    selected_answer_index = Column(Integer, nullable=False)
    is_correct = Column(sa.Boolean(), nullable=False)
    xp_earned = Column(Integer, server_default=sa.text('0'), nullable=False)
    time_taken_seconds = Column(Integer, nullable=True)
    submitted_at = Column(DateTime, server_default=func.now(), nullable=True)

    # relationships
    student = relationship("Student", backref="quiz_submissions")
    question = relationship("Question", backref="quiz_submissions")


class StudentProgress(Base):
    __tablename__ = "student_progress"
    __table_args__ = (sa.UniqueConstraint('student_id', 'chapter_id', name='uq_student_chapter'),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    chapter_id = Column(String(50), ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False)
    mastery_score = Column(sa.Numeric(5, 2), server_default=sa.text('0'), nullable=False)
    questions_completed = Column(Integer, server_default=sa.text('0'), nullable=False)
    questions_correct = Column(Integer, server_default=sa.text('0'), nullable=False)
    last_answered_at = Column(DateTime, nullable=True)

    student = relationship("Student", backref="progress")
    chapter = relationship("Chapter", backref="progress")
    
    
from sqlalchemy import Date, UniqueConstraint

class DailyAnalytics(Base):
    __tablename__ = "daily_analytics"
    __table_args__ = (
        UniqueConstraint('student_id', 'analytics_date', name='uq_student_analytics_date'),
        Index('idx_daily_analytics_student', 'student_id'),
        Index('idx_daily_analytics_date', 'analytics_date'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    analytics_date = Column(Date, nullable=False)
    questions_answered = Column(Integer, server_default=sa.text('0'), nullable=False)
    questions_correct = Column(Integer, server_default=sa.text('0'), nullable=False)
    xp_earned = Column(Integer, server_default=sa.text('0'), nullable=False)
    time_spent_minutes = Column(Integer, server_default=sa.text('0'), nullable=False)
    streak_count = Column(Integer, server_default=sa.text('0'), nullable=False)