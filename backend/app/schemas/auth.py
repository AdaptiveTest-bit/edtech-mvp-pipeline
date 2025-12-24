# backend/app/schemas/auth.py
from pydantic import BaseModel, EmailStr, Field

class LoginRequest(BaseModel):
    """Login request"""
    email: str
    password: str

class RegisterRequest(BaseModel):
    """User registration request"""
    email: str
    password: str = Field(..., min_length=8)
    name: str
    grade_level: int = Field(..., ge=1, le=12)

class AuthResponse(BaseModel):
    """Authentication response"""
    id: int
    email: str
    name: str
    user_id: str
    token: str
    token_type: str = "bearer"
    
    class Config:
        from_attributes = True
