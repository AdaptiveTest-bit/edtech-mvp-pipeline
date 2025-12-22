# db/models/curriculum.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, CheckConstraint, Index, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from src.database.services import Base


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sequence_order = Column(Integer, nullable=False)
    unit_tag = Column(String(50))

    # one to many relationship with Topic
    topics = relationship("Topic", back_populates="chapter", cascade="all, delete")


class Topic(Base):
    __tablename__ = "topics"
    # __table_args__ = {"schema": "curriculum"}

    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(
        Integer, ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False
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
    __table_args__ = (
        CheckConstraint("difficulty_level BETWEEN 1 AND 3"),
        Index("idx_questions_concept_diff", "concept_id", "difficulty_level"),
        # {"schema": "curriculum"},
    )

    id = Column(Integer, primary_key=True, index=True)
    concept_id = Column(
        Integer, ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False
    )
    content = Column(JSONB, nullable=False)
    difficulty_level = Column(Integer, nullable=False)
    correct_option_key = Column(String(10), nullable=False)
    explanation = Column(Text, nullable=False)
    # many to one relationship with Concept
    concept = relationship("Concept", back_populates="questions")

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

