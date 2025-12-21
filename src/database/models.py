from typing import Any, Optional
from pydantic import BaseModel


class ChapterCreate(BaseModel):
    name: str
    sequence_order: int
    unit_tag: Optional[str] = None


class TopicCreate(BaseModel):
    chapter_id: int
    name: str
    description: Optional[str] = None


class ConceptCreate(BaseModel):
    topic_id: int
    name: str
    misconception_guide: Optional[str] = None


class QuestionCreate(BaseModel):
    concept_id: int
    content: dict[str, Any]  # JSON payload
    difficulty_level: int  # 1–3
    correct_option_key: str
    explanation: str


class ResponseModel(BaseModel):
    success: bool
    message: str
    data: Any
    status_code: int
