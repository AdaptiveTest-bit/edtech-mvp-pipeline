# backend/app/api/routes/auth.py
"""
Authentication API routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Student, Parent
from app.schemas.auth import LoginRequest, RegisterRequest, AuthResponse
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/register/student", response_model=AuthResponse)
async def register_student(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new student
    
    **Note:** In production, implement proper password hashing (bcrypt)
    """
    # Check if email exists
    existing_student = db.query(Student).filter(
        Student.email == request.email
    ).first()
    
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new student
    student = Student(
        user_id=str(uuid.uuid4()),
        email=request.email,
        name=request.name,
        grade_level=request.grade_level,
        total_xp=0,
        current_streak=0,
        best_streak=0,
        created_at=datetime.utcnow()
    )
    
    db.add(student)
    db.commit()
    db.refresh(student)
    
    return {
        "id": student.id,
        "email": student.email,
        "name": student.name,
        "user_id": student.user_id,
        "token": f"token_{student.user_id}",  # Dummy token
        "token_type": "bearer"
    }

@router.post("/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login with email and password
    
    **Note:** In production, implement proper password verification
    """
    student = db.query(Student).filter(
        Student.email == request.email
    ).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # In production, verify password hash
    # if not verify_password(request.password, student.password_hash):
    #     raise HTTPException(...)
    
    return {
        "id": student.id,
        "email": student.email,
        "name": student.name,
        "user_id": student.user_id,
        "token": f"token_{student.user_id}",  # Dummy token
        "token_type": "bearer"
    }

@router.post("/register/parent", response_model=AuthResponse)
async def register_parent(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """Register a new parent"""
    existing_parent = db.query(Parent).filter(
        Parent.email == request.email
    ).first()
    
    if existing_parent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    parent = Parent(
        user_id=str(uuid.uuid4()),
        email=request.email,
        name=request.name,
        created_at=datetime.utcnow()
    )
    
    db.add(parent)
    db.commit()
    db.refresh(parent)
    
    return {
        "id": parent.id,
        "email": parent.email,
        "name": parent.name,
        "user_id": parent.user_id,
        "token": f"token_{parent.user_id}",
        "token_type": "bearer"
    }
