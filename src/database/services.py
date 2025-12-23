from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

# Database configuration
RDS_DB_USERNAME = "amritkarn"
RDS_DB_PASSWORD = "root"
RDS_DB_PORT = "5432"
RDS_DB_NAME = "my_database"
RDS_DB_HOST = "localhost"

# Construct the connection URL
db_url = f"postgresql://{RDS_DB_USERNAME}:{RDS_DB_PASSWORD}@{RDS_DB_HOST}/{RDS_DB_NAME}"

engine = create_engine(db_url)
Session = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


@contextmanager
def db_session() -> Session:
    session = Session()
    try:
        # Schema creation is handled via Alembic migrations.
        # Do not call `Base.metadata.create_all()` here so migrations manage DDL.
        yield session
    except SQLAlchemyError as e:
        session.rollback()
        raise e
    finally:
        session.close()
