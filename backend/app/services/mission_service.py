"""
Service for mission operations
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import Mission, Student
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple


class MissionService:
    """Service for mission workflows"""
    
    @staticmethod
    def create_daily_mission(
        db: Session,
        student_id: int,
        title: str,
        description: str,
        reward_xp: int = 50
    ) -> Mission:
        """Create a new mission for student"""
        mission = Mission(
            student_id=student_id,
            title=title,
            description=description,
            reward_xp=reward_xp,
            due_date=datetime.utcnow() + timedelta(days=1)  # Due tomorrow
        )
        db.add(mission)
        db.commit()
        return mission
    
    @staticmethod
    def get_today_mission(db: Session, student_id: int) -> Dict[str, Any]:
        """Get today's active mission for student"""
        today = datetime.utcnow()
        
        mission = db.query(Mission).filter(
            and_(
                Mission.student_id == student_id,
                Mission.status == "active",
                Mission.due_date >= today
            )
        ).first()
        
        if not mission:
            return {
                "status": "no_mission",
                "message": "No active mission today"
            }
        
        return {
            "id": mission.id,
            "title": mission.title,
            "description": mission.description,
            "reward_xp": mission.reward_xp,
            "status": mission.status,
            "due_date": mission.due_date.isoformat()
        }
    
    @staticmethod
    def get_student_missions(
        db: Session,
        student_id: int,
        status: str = None
    ) -> List[Dict[str, Any]]:
        """Get all missions for student"""
        query = db.query(Mission).filter(Mission.student_id == student_id)
        
        if status:
            query = query.filter(Mission.status == status)
        
        missions = query.order_by(Mission.created_at.desc()).all()
        
        return [
            {
                "id": m.id,
                "title": m.title,
                "description": m.description,
                "reward_xp": m.reward_xp,
                "status": m.status,
                "created_at": m.created_at.isoformat(),
                "due_date": m.due_date.isoformat()
            }
            for m in missions
        ]
    
    @staticmethod
    def complete_mission(
        db: Session,
        mission_id: int,
        student_id: int
    ) -> Tuple[Dict[str, Any], int]:
        """Mark mission as completed"""
        try:
            mission = db.query(Mission).filter(
                and_(
                    Mission.id == mission_id,
                    Mission.student_id == student_id
                )
            ).first()
            
            if not mission:
                return {"error": "Mission not found"}, 404
            
            mission.status = "completed"
            mission.completed_at = datetime.utcnow()
            db.commit()
            
            # Reward XP to student
            student = db.query(Student).filter(Student.id == student_id).first()
            if student:
                student.total_xp += mission.reward_xp
                db.commit()
            
            return {
                "status": "success",
                "message": f"Mission completed! +{mission.reward_xp} XP",
                "xp_earned": mission.reward_xp
            }, 200
            
        except Exception as e:
            db.rollback()
            return {"error": str(e)}, 500
