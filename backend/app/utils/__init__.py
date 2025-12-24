# backend/app/utils/frontend_integration.py
"""
Frontend integration helpers for API response formatting
"""
from typing import Dict, Any, List
from datetime import datetime

class ResponseFormatter:
    """Format API responses for frontend consumption"""
    
    @staticmethod
    def format_question(question: Dict[str, Any]) -> Dict[str, Any]:
        """Format question for Arena component"""
        return {
            "id": question.get("id"),
            "conceptId": question.get("concept_id"),
            "difficultyLevel": question.get("difficulty_level"),
            "content": question.get("content", {}),
            "explanation": question.get("explanation")
        }
    
    @staticmethod
    def format_quiz_feedback(feedback: Dict[str, Any]) -> Dict[str, Any]:
        """Format quiz feedback for FeedbackOverlay component"""
        return {
            "isCorrect": feedback.get("is_correct"),
            "xpEarned": feedback.get("xp_earned"),
            "explanation": feedback.get("explanation"),
            "masteryScore": feedback.get("concept_mastery_score"),
            "leitnerBox": feedback.get("concept_leitner_box"),
            "nextReviewDate": feedback.get("next_review_date"),
            "totalXp": feedback.get("total_xp")
        }
    
    @staticmethod
    def format_progress(progress: Dict[str, Any]) -> Dict[str, Any]:
        """Format progress data for MissionControl dashboard"""
        chapters = []
        for ch in progress.get("chapters", []):
            chapters.append({
                "id": ch.get("id"),
                "name": ch.get("name"),
                "masteryScore": ch.get("mastery_score"),
                "status": ch.get("status"),
                "questionsCompleted": ch.get("questions_completed"),
                "questionsCorrect": ch.get("questions_correct")
            })
        
        return {
            "studentId": progress.get("student_id"),
            "name": progress.get("name"),
            "totalXp": progress.get("total_xp"),
            "currentStreak": progress.get("current_streak"),
            "bestStreak": progress.get("best_streak"),
            "chapters": chapters
        }
    
    @staticmethod
    def format_mastery_radar(chapters: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Format data for WeaknessRadar parent component"""
        radar_data = []
        for ch in chapters:
            radar_data.append({
                "subject": ch.get("name"),
                "masteryScore": ch.get("mastery_score"),
                "questionsAnswered": ch.get("questions_completed")
            })
        
        return {"data": radar_data}
