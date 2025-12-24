from datetime import datetime, timedelta
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import hashlib

from src.database.repository import Student
from src.database.services import db_session


SECRET_KEY = "EduTech"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")



def _pre_hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def hash_password(password: str) -> str:
    pre_hashed = _pre_hash_password(password)
    return pwd_context.hash(pre_hashed)


def verify_password(password: str, hashed_password: str) -> bool:
    pre_hashed = _pre_hash_password(password)
    return pwd_context.verify(pre_hashed, hashed_password)



def create_student_token(student: Student) -> str:
    """Create JWT token for student"""
    payload = {
        "student_id": student.id,
        "email": student.email,
        "Class": student.standard,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_student_token(token: str, db: Session) -> Student:
    """Verify JWT token and return Student object"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        student_id = payload.get("student_id")
        email = payload.get("email")

        if not student_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    student = (
        db.query(Student)
        .filter(Student.id == student_id, Student.email == email)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Student not found",
        )

    return student
