from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from src.database.services import db_session
from src.auth.auth_bearer import verify_student_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/students/login")


def get_current_student(
    token: str = Depends(oauth2_scheme)):
    
    with db_session() as db:
        return verify_student_token(token, db)
