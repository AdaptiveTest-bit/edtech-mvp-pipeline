"""
EdTech MVP Backend - Main Entry Point
Starts FastAPI server with Uvicorn
"""
import uvicorn
import sys
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from app import create_app
    from app.database import init_db
    from app.core.config import settings
except ImportError as e:
    logger.error(f"Failed to import required modules: {e}")
    logger.error("Make sure all dependencies are installed: pip install -r requirements.txt")
    sys.exit(1)

# Initialize database (create tables if they don't exist)
try:
    init_db()
    logger.info("✅ Database initialized successfully")
except Exception as e:
    logger.warning(f"⚠️  Database initialization warning: {e}")
    logger.warning("Make sure PostgreSQL is running and database exists")

# Create FastAPI app
try:
    app = create_app()
    logger.info("✅ FastAPI application created successfully")
except Exception as e:
    logger.error(f"Failed to create FastAPI app: {e}")
    sys.exit(1)


if __name__ == "__main__":
    logger.info(f"🚀 Starting EdTech MVP Backend")
    logger.info(f"📡 Host: {settings.SERVER_HOST}")
    logger.info(f"🔌 Port: {settings.SERVER_PORT}")
    logger.info(f"🔄 Reload: {settings.SERVER_RELOAD}")
    logger.info(f"📦 Environment: {settings.ENVIRONMENT}")
    logger.info(f"🗄️  Database: {settings.DATABASE_URL}")
    
    try:
        uvicorn.run(
            "main:app",
            host=settings.SERVER_HOST,
            port=settings.SERVER_PORT,
            reload=settings.SERVER_RELOAD,
            log_level="info"
        )
    except KeyboardInterrupt:
        logger.info("🛑 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Server error: {e}")
        sys.exit(1)
