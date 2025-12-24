from datetime import date
# ...existing code...

class DailyAnalyticsCreate(BaseModel):
    student_id: int
    analytics_date: date
    questions_answered: int = 0
    questions_correct: int = 0
    xp_earned: int = 0
    time_spent_minutes: int = 0
    streak_count: int = 0
from typing import Any, Optional,List
from pydantic import BaseModel,EmailStr, Field



class ChapterCreate(BaseModel):
    name: str
    description: Optional[str] = None
    subject: str
    order: Optional[int] = None
    is_locked: Optional[bool] = True
    unlock_xp_required: Optional[int] = 0


class TopicCreate(BaseModel):
    chapter_id: str
    name: str
    description: Optional[str] = None


class ConceptCreate(BaseModel):
    topic_id: int
    name: str
    misconception_guide: Optional[str] = None


class QuestionCreate(BaseModel):
    quiz_id: str
    chapter_id: str
    question_text: str
    options: list[Any]
    correct_answer_index: int
    explanation: Optional[str] = None
    image_url: Optional[str] = None
    difficulty_level: Optional[str] = None
    created_at: Optional[str] = None


class ResponseModel(BaseModel):
    success: bool
    message: Optional[str]
    data: Optional[Any]
    status_code: int

# class AddressCreateRequest(BaseModel):
#     street: Optional[str]
#     city: Optional[str]
#     state: Optional[str]
#     pincode: str

class ParentCreateRequest(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr]


# class Gender(Enum):
#     MALE = 'MALE'
#     FEMALE = "FEMALE"

class StudentCreateRequest(BaseModel):
    first_name: str
    last_name: str
    age: int = Field(..., ge=6, le=25)
    phone: Optional[str]
    email: EmailStr
    gender: str 
    standard: str
    password: str
    parent_details: Optional[ParentCreateRequest]
    
class StudentLoginRequest(BaseModel):
    email: EmailStr
    password: str
