# backend/app/database.py
from sqlalchemy import create_engine, event, inspect
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool
from app.core.config import settings
from typing import Generator

# Create base for ORM models
Base = declarative_base()

# Create engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40,
    pool_recycle=3600,
    pool_pre_ping=True,
    echo=settings.DATABASE_ECHO,
    connect_args={"connect_timeout": 10}
)

# Register event listener for schema search path
@event.listens_for(engine, "connect")
def set_search_path(dbapi_conn, connection_record):
    """Set search_path for cross-schema queries"""
    cursor = dbapi_conn.cursor()
    try:
        cursor.execute("SET search_path TO users,curriculum,analytics,public")
        cursor.close()
    except Exception as e:
        print(f"Warning: Could not set search_path: {e}")

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False
)

# Dependency for getting DB session
def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database utilities
def init_db():
    """Initialize database - create all tables"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables initialized")

def get_db_info():
    """Get database schema info"""
    inspector = inspect(engine)
    schemas = inspector.get_schema_names()
    return {
        "schemas": schemas,
        "tables": {schema: inspector.get_table_names(schema=schema) for schema in schemas}
    }
