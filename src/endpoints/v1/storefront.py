
# from sqlalchemy import text
from fastapi.encoders import jsonable_encoder


from fastapi import (
    APIRouter,
    status,
    Query
)
from starlette.responses import JSONResponse
from src.database.models import (
    ChapterCreate,
    ResponseModel,
    StudentCreateRequest
)
from src.database.repository import Chapter,Student,Parent
from src.database.services import db_session


router = APIRouter(prefix="/storefront", tags=["Suject--Collection)"])


@router.post(
    "/add-student",
)
async def RegisterStudent(
    student_obj: StudentCreateRequest,
):
    try:
        with db_session() as db:
            existing_student = (
                db.query(Student)
                .filter(Student.email == student_obj.email)
                .first()
            )
        if existing_student:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "message": "Student with this email already exists",
                    "data": None,
                    "status_code": status.HTTP_400_BAD_REQUEST
                }
            )
        name=student_obj.first_name + " " + student_obj.last_name


        student = Student(
            first_name=student_obj.first_name,
            last_name=student_obj.last_name,
            age=student_obj.age,
            phone=student_obj.phone,
            email=student_obj.email,
            gender=student_obj.gender,
            standard=student_obj.standard,
            password_hash=student_obj.password)
        

        if student_obj.parent_details:
            student.parent = Parent(
                name=student_obj.parent_details.name,
                phone=student_obj.parent_details.phone,
                email=student_obj.parent_details.email
            )
        data = {
                # "id": student.id,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "email": student.email,
                "age": student.age,
                "phone": student.phone,
                "gender": student.gender,
                "standard": student.standard,
                "parent": {
                    "name": student.parent.name,
                    "phone": student.parent.phone,
                    "email": student.parent.email
                } if student.parent else None
            }

        db.add(student)
        db.commit()
        db.refresh(student)

        return {
            "success": True,
            "message": "Student created successfully",
            "data": data,
            "status_code": status.HTTP_201_CREATED
        }

    except Exception as e:
        db.rollback()
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": str(e) or "Unexpected error occurred",
                "data": None,
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR
            }
        )

@router.get("/get_students")
def get_Student(
    student_id: int = Query(None),
    email: str = Query(None),
    phone: str = Query(None),
):
    try:
        if not any([student_id, email, phone]):
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "message": "Please provide student_id, email, or phone",
                    "data": None,
                    "status_code": status.HTTP_400_BAD_REQUEST
                }
            )
        with db_session() as db:
            query = db.query(Student)

        if student_id:
            query = query.filter(Student.id == student_id)
        if email:
            query = query.filter(Student.email == email)
        if phone:
            query = query.filter(Student.phone == phone)

        student = query.first()

        if not student:
            return JSONResponse(
                status_code=404,
                content={
                    "success": False,
                    "message": "Student not found",
                    "data": None,
                    "status_code": status.HTTP_404_NOT_FOUND
                }
            )

        return {
            "success": True,
            "message": None,
            "data": (student),
            "status_code": status.HTTP_200_OK
        }

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": str(e) or "Unexpected error occurred",
                "data": None,
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR
            }
        )

@router.post(
    "/add-chapter",
)
async def create_Chapter(
    chapter_create: ChapterCreate,
):
    try:

        with db_session() as db:
            chapter = Chapter(**chapter_create.dict())
            data=chapter.name
            db.add(chapter)
            db.commit()

        response = ResponseModel(
            success=True,
            message="Chapter details saved Successfully.",
            data=data,
            status_code=status.HTTP_201_CREATED,
        )
        return JSONResponse(content=response.dict(),status_code=200)

    except Exception as e:
        error = ResponseModel(
            success=False,
            message="Unexpected error: " + str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            data=None,
        )
        return JSONResponse(content=error.dict(),status_code=500)


@router.get("/all_chapters", response_model=ResponseModel)
async def get_all_chapters():
    try:
        with db_session() as db:
            chapters = db.query(Chapter).all()
        datas = [(ch) for ch in chapters]
        datas = jsonable_encoder(datas)
        response = ResponseModel(
            success=True,
            message=None,
            data=datas,
            status_code=status.HTTP_200_OK,
        )
        return JSONResponse(content=response.dict(),status_code=200)

    except Exception as e:
        response = ResponseModel(
            success=False,
            message=str(e) if str(e) else "Unexpected error occurred",
            data=None,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

        return JSONResponse(
            content=response.dict(),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/chapters/{chapter_no}", response_model=ResponseModel)
async def get_chapter_by_number(chapter_no: int):
    try:
        with db_session() as db:
            chapter = (
                db.query(Chapter).filter(Chapter.sequence_order == chapter_no).first()
            )

        if not chapter:
            # Chapter not found, but return consistent ResponseModel
            response = ResponseModel(
                success=False,
                message=f"Chapter {chapter_no} not found.",
                data=None,
                status_code=status.HTTP_404_NOT_FOUND,
            )
            return JSONResponse(
                content=response.dict(), status_code=status.HTTP_404_NOT_FOUND
            )

        # Serialize the chapter using jsonable_encoder
        chapter_data = jsonable_encoder(chapter)

        response = ResponseModel(
            success=True,
            message=f"Chapter {chapter_no} fetched successfully.",
            data=chapter_data,
            status_code=status.HTTP_200_OK,
        )
        return JSONResponse(content=response.dict(), status_code=status.HTTP_200_OK)

    except Exception as e:
        error = ResponseModel(
            success=False,
            message=f"Unexpected error: {str(e)}",
            data=None,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
        return JSONResponse(
            content=error.dict(), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
