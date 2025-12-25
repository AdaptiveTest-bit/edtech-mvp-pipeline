# backend/app/__init__.py
"""
FastAPI application factory and configuration
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import quiz, student, auth, progress, onboarding, missions
from app.database import Base, engine


def create_app() -> FastAPI:
    """
    Create and configure FastAPI application
    
    This function:
    1. Creates the FastAPI app instance
    2. Adds CORS middleware
    3. Registers all API routes
    4. Adds health check endpoints
    """
    app = FastAPI(
        title=settings.API_TITLE,
        description=settings.API_DESCRIPTION,
        version=settings.API_VERSION,
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
    )
    
    # Add CORS middleware for frontend integration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
        allow_methods=settings.CORS_ALLOW_METHODS,
        allow_headers=settings.CORS_ALLOW_HEADERS,
    )
    
    # Include all API routers
    app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
    app.include_router(student.router, prefix="/api/student", tags=["student"])
    app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
    app.include_router(onboarding.router, prefix="/api/onboarding", tags=["onboarding"])
    app.include_router(missions.router, prefix="/api/missions", tags=["missions"])
    
    # Health check endpoint
    @app.get("/health")
    async def health_check():
        """
        Health check endpoint
        Returns: {"status": "ok", "environment": "development"}
        """
        return {
            "status": "ok",
            "message": "Backend is running",
            "environment": settings.ENVIRONMENT,
            "debug": settings.DEBUG
        }
    
    # Root endpoint
    @app.get("/")
    async def root():
        """
        Root endpoint
        Returns: {"message": "EdTech MVP API", "docs": "/docs", "version": "1.0.0"}
        """
        return {
            "message": "EdTech MVP API",
            "docs": "/docs" if settings.DEBUG else None,
            "version": settings.API_VERSION,
            "environment": settings.ENVIRONMENT
        }
    
    # Startup event - initialize database
    @app.on_event("startup")
    async def startup_event():
        """
        Initialize database on app startup
        Creates all tables if they don't exist
        """
        try:
            Base.metadata.create_all(bind=engine)
            print("✅ Database tables initialized on startup")
        except Exception as e:
            print(f"⚠️  Database initialization warning on startup: {e}")
    
    return app


# Create app instance
app = create_app()
