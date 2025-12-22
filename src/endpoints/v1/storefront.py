
# from sqlalchemy import text
from fastapi.encoders import jsonable_encoder


from fastapi import (
    APIRouter,
    status,
)
from starlette.responses import JSONResponse
from src.database.models import (
    ChapterCreate,
    ResponseModel,
)
from src.database.repository import Chapter
from src.database.services import db_session


router = APIRouter(prefix="/edu", tags=["Suject--Collection)"])


@router.post(
    "/add-chapter",
)
async def create_employee(
    chapter_create: ChapterCreate,
):
    """
    To create add chapter one by one.

     Query Param:
     **None**\n

     Path Param:
     - **None**\n

     Body Param :

       - **name**:  Chapter name of the subject. \n
       - **sequence_order** : None \n
       - **unit_tag** (str, optional): Unit number.\n

     Returns : 201 OK
       - Response model with success status, message, status code, and data.
    """
    try:

        with db_session() as db:
            chapter = Chapter(**chapter_create.dict())
            db.add(chapter)
            db.commit()
        response = ResponseModel(
            success=True,
            message="Chapter details saved Successfully.",
            data=None,
            status_code=status.HTTP_201_CREATED,
        )
        return JSONResponse(content=response.dict())

    except Exception as e:
        error = ResponseModel(
            success=False,
            message="Unexpected error: " + str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            data=None,
        )
        return JSONResponse(content=error.dict())


@router.get("/all_chapters", response_model=ResponseModel)
async def get_all_chapters():
    try:
        with db_session() as db:
            chapters = db.query(Chapter).all()
        datas = [ch for ch in chapters]
        datas = jsonable_encoder(datas)
        response = ResponseModel(
            success=True,
            message="All chapters fetched successfully.",
            data=datas,
            status_code=status.HTTP_200_OK,
        )
        return JSONResponse(content=response.dict())

    except Exception as e:
        error = ResponseModel(
            success=False,
            message="Unexpected error: " + str(e),
            data=None,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
        return JSONResponse(content=error.dict())


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
