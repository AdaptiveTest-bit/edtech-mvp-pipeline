from typing import Any, Optional,List
from pydantic import BaseModel,EmailStr, Field



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