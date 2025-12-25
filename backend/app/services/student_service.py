# backend/app/services/student_service.py
"""
Student service for managing student data and progress
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import (
    Student, StudentProgress, StudentMastery, Chapter, Concept
)
from typing import Dict, Any, List, Optional

class StudentService:
    """Service for student operations"""
    
    @staticmethod
    def get_student(db: Session, student_id: int) -> Student:
        """Get student by ID"""
        return db.query(Student).filter(Student.id == student_id).first()
    
    @staticmethod
    def get_student_progress(
        db: Session,
        student_id: int
    ) -> Dict[str, Any]:
        """Get complete student progress across all chapters"""
        student = StudentService.get_student(db, student_id)
        if not student:
            return None
        
        # Get all chapter progress
        progress_list = db.query(StudentProgress).filter(
            StudentProgress.user_id == student_id
        ).all()
        
        chapters = []
        for p in progress_list:
            chapter = db.query(Chapter).filter(Chapter.id == p.chapter_id).first()
            chapters.append({
                "chapter_id": p.chapter_id,
                "name": chapter.name if chapter else "Unknown",
                "mastery_score": float(p.mastery_score),
                "questions_completed": p.questions_completed,
                "questions_correct": p.questions_correct,
                "status": "unlocked" if p.mastery_score > 0 else "locked"
            })
        
        return {
            "student_id": student.id,
            "name": student.name,
            "email": student.email,
            "total_xp": student.total_xp,
            "current_streak": student.current_streak,
            "best_streak": student.best_streak,
            "chapters": chapters
        }
    
    @staticmethod
    def get_concept_mastery(
        db: Session,
        student_id: int,
        concept_id: int
    ) -> Dict[str, Any]:
        """Get concept-level mastery info"""
        concept = db.query(Concept).filter(Concept.id == concept_id).first()
        if not concept:
            return None
        
        mastery = db.query(StudentMastery).filter(
            StudentMastery.user_id == student_id,
            StudentMastery.concept_id == concept_id
        ).first()
        
        if not mastery:
            return {
                "concept_id": concept_id,
                "concept_name": concept.name,
                "mastery_score": 0.0,
                "leitner_box": 1,
                "next_review_date": None,
                "status": "not_started"
            }
        
        from datetime import date
        is_review_needed = date.today() >= mastery.next_review_date
        status = "review_needed" if is_review_needed else "mastered"
        
        return {
            "concept_id": concept_id,
            "concept_name": concept.name,
            "mastery_score": float(mastery.mastery_score),
            "leitner_box": mastery.leitner_box,
            "next_review_date": mastery.next_review_date.isoformat(),
            "last_practiced_at": mastery.last_practiced_at.isoformat(),
            "status": status
        }
    
    @staticmethod
    def get_all_concepts_mastery(
        db: Session,
        student_id: int
    ) -> Dict[str, Any]:
        """Get mastery for all concepts that student has attempted"""
        from datetime import date
        
        # Verify student exists
        student = StudentService.get_student(db, student_id)
        if not student:
            return None
        
        # Get all StudentMastery records for this student, join with Concept info
        mastery_records = db.query(StudentMastery, Concept).join(
            Concept, StudentMastery.concept_id == Concept.id
        ).filter(
            StudentMastery.user_id == student_id
        ).all()
        
        concepts = []
        for mastery, concept in mastery_records:
            # Determine status based on review date
            is_review_needed = date.today() >= mastery.next_review_date
            status = "review_needed" if is_review_needed else "reviewing"
            
            concepts.append({
                "concept_id": mastery.concept_id,
                "concept_name": concept.name,
                "mastery_score": float(mastery.mastery_score),
                "leitner_box": mastery.leitner_box,
                "next_review_date": mastery.next_review_date.isoformat(),
                "status": status
            })
        
        return {
            "concepts": concepts
        }
    
    @staticmethod
    def get_student_streak(db: Session, student_id: int) -> Dict[str, Any]:
        """Get student streak information"""
        student = StudentService.get_student(db, student_id)
        if not student:
            return None
        
        return {
            "student_id": student.id,
            "current_streak": student.current_streak,
            "best_streak": student.best_streak,
            "total_xp": student.total_xp
        }
