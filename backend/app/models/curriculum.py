# backend/app/models/curriculum.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.database import Base

class Chapter(Base):
    __tablename__ = "chapters"
    __table_args__ = {"schema": "curriculum"}
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    sequence_order = Column(Integer, nullable=False)
    unit_tag = Column(String(50), nullable=True)

class Topic(Base):
    __tablename__ = "topics"
    __table_args__ = {"schema": "curriculum"}
    
    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(Integer, ForeignKey("curriculum.chapters.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)

class Concept(Base):
    __tablename__ = "concepts"
    __table_args__ = {"schema": "curriculum"}
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("curriculum.topics.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    misconception_guide = Column(Text, nullable=True)

class Question(Base):
    __tablename__ = "questions"
    __table_args__ = {"schema": "curriculum"}
    
    id = Column(Integer, primary_key=True, index=True)
    concept_id = Column(Integer, ForeignKey("curriculum.concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)  # JSON stored as TEXT: {"text": "...", "options": {...}, "hint": "..."}
    difficulty_level = Column(Integer, nullable=False, default=1)
    correct_option_key = Column(String(10), nullable=False)
    explanation = Column(Text, nullable=False)
