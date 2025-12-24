# backend/app/services/quiz_service.py
"""
Quiz service for handling answer submissions and feedback
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import (
    Question, Attempt, StudentMastery, QuizSubmission, 
    StudentProgress, Student, Concept, Topic, Chapter
)
from app.services.mastery_service import MasteryService
from datetime import datetime, date
from typing import Dict, Any, Tuple

class QuizService:
    """Service for quiz operations"""
    
    @staticmethod
    def get_question(db: Session, question_id: int) -> Question:
        """Get a question by ID"""
        return db.query(Question).filter(Question.id == question_id).first()
    
    @staticmethod
    def get_random_question(
        db: Session,
        concept_id: int,
        difficulty: int = None
    ) -> Question:
        """Get random question from concept"""
        query = db.query(Question).filter(Question.concept_id == concept_id)
        
        # Only filter by difficulty if specified
        if difficulty is not None:
            query = query.filter(Question.difficulty_level == difficulty)
        
        question = query.order_by(func.random()).first()
        return question
    
    @staticmethod
    def submit_answer(
        db: Session,
        student_id: int,
        question_id: int,
        selected_option: str,
        time_taken_seconds: int = None
    ) -> Tuple[Dict[str, Any], int]:
        """
        Submit an answer and update mastery tracking
        
        Returns:
            (response_dict, status_code)
        """
        try:
            # 1. Get question
            question = QuizService.get_question(db, question_id)
            if not question:
                return {"error": "Question not found"}, 404
            
            # 2. Check if answer is correct
            is_correct = selected_option.upper() == question.correct_option_key.upper()
            xp_earned = 10 if is_correct else 0
            
            # 3. Record attempt
            attempt = Attempt(
                user_id=student_id,
                question_id=question_id,
                is_correct=is_correct,
                selected_option=selected_option,
                time_taken_seconds=time_taken_seconds,
                attempted_at=datetime.utcnow()
            )
            db.add(attempt)
            
            # 4. Record submission
            submission = QuizSubmission(
                user_id=student_id,
                question_id=question_id,
                is_correct=is_correct,
                time_taken_seconds=time_taken_seconds,
                selected_option=ord(selected_option.upper()) - ord('A'),
                xp_earned=xp_earned,
                submitted_at=datetime.utcnow()
            )
            db.add(submission)
            
            # 5. Update student XP
            student = db.query(Student).filter(Student.id == student_id).first()
            if student:
                student.total_xp += xp_earned
                student.updated_at = datetime.utcnow()
            
            # 6. Update concept mastery (Leitner box + EMA)
            mastery = MasteryService.update_mastery_score(
                db,
                student_id,
                question.concept_id,
                is_correct
            )
            
            # 7. Get concept hierarchy for progress update
            concept = db.query(Concept).filter(Concept.id == question.concept_id).first()
            topic = db.query(Topic).filter(Topic.id == concept.topic_id).first()
            chapter = db.query(Chapter).filter(Chapter.id == topic.chapter_id).first()
            
            # 8. Update chapter-level progress
            progress = db.query(StudentProgress).filter(
                StudentProgress.user_id == student_id,
                StudentProgress.chapter_id == chapter.id
            ).first()
            
            if progress:
                progress.questions_completed += 1
                progress.questions_correct += 1 if is_correct else 0
                progress.mastery_score = (progress.questions_correct / progress.questions_completed) * 100
                progress.last_answered_at = datetime.utcnow()
            else:
                progress = StudentProgress(
                    user_id=student_id,
                    chapter_id=chapter.id,
                    mastery_score=100.0 if is_correct else 0.0,
                    questions_completed=1,
                    questions_correct=1 if is_correct else 0,
                    last_answered_at=datetime.utcnow()
                )
                db.add(progress)
            
            db.commit()
            
            # 9. Return response
            return {
                "is_correct": is_correct,
                "xp_earned": xp_earned,
                "explanation": question.explanation,
                "concept_mastery_score": float(mastery.mastery_score),
                "concept_leitner_box": mastery.leitner_box,
                "chapter_mastery_score": float(progress.mastery_score),
                "total_xp": student.total_xp if student else 0,
                "next_review_date": mastery.next_review_date.isoformat()
            }, 200
        
        except Exception as e:
            db.rollback()
            return {"error": str(e)}, 500
