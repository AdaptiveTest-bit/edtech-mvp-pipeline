"""
Missions API routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.mission_service import MissionService
from pydantic import BaseModel

router = APIRouter()


class MissionResponse(BaseModel):
    """Mission response"""
    id: int = None
    title: str
    description: str
    reward_xp: int
    status: str
    due_date: str


class CreateMissionRequest(BaseModel):
    """Create mission request"""
    title: str
    description: str
    reward_xp: int = 50


@router.post("/create/{student_id}")
async def create_mission(
    student_id: int,
    request: CreateMissionRequest,
    db: Session = Depends(get_db)
):
    """Create a new mission for student"""
    try:
        mission = MissionService.create_daily_mission(
            db,
            student_id,
            request.title,
            request.description,
            request.reward_xp
        )
        return {
            "status": "success",
            "message": "Mission created successfully",
            "mission": {
                "id": mission.id,
                "title": mission.title,
                "description": mission.description,
                "reward_xp": mission.reward_xp,
                "status": mission.status,
                "due_date": mission.due_date.isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/today/{student_id}")
async def get_today_mission(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Get today's mission for student"""
    return MissionService.get_today_mission(db, student_id)


@router.get("/list/{student_id}")
async def list_missions(
    student_id: int,
    status: str = None,
    db: Session = Depends(get_db)
):
    """Get all missions for student"""
    return {
        "missions": MissionService.get_student_missions(db, student_id, status),
        "count": len(MissionService.get_student_missions(db, student_id, status))
    }


@router.post("/{mission_id}/complete")
async def complete_mission(
    mission_id: int,
    student_id: int,
    db: Session = Depends(get_db)
):
    """Mark mission as completed"""
    response, status_code = MissionService.complete_mission(
        db,
        mission_id,
        student_id
    )
    
    if status_code != 200:
        raise HTTPException(status_code=status_code, detail=response.get("error"))
    
    return response
