"""
Application configuration using Pydantic v2 Settings
Loads from environment variables and .env file
"""
import os
from functools import lru_cache
from typing import Optional

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings


class Settings(BaseSettings):
    """
    Application settings for EdTech MVP Backend
    All values can be overridden via environment variables
    """
    
    # ===== DATABASE CONFIGURATION =====
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://kunalranjan@localhost:5432/edtech_mvp"
    )
    DATABASE_ECHO: bool = os.getenv("DATABASE_ECHO", "False").lower() == "true"
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "20"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "40"))
    
    # ===== SERVER CONFIGURATION =====
    SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
    SERVER_PORT: int = int(os.getenv("SERVER_PORT", "8000"))
    SERVER_RELOAD: bool = os.getenv("SERVER_RELOAD", "True").lower() == "true"
    
    # ===== FRONTEND CONFIGURATION =====
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # ===== REDIS CONFIGURATION =====
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    REDIS_ENABLED: bool = os.getenv("REDIS_ENABLED", "False").lower() == "true"
    CACHE_TTL_QUESTIONS: int = int(os.getenv("CACHE_TTL_QUESTIONS", "86400"))
    CACHE_TTL_PROGRESS: int = int(os.getenv("CACHE_TTL_PROGRESS", "900"))
    CACHE_TTL_ANALYTICS: int = int(os.getenv("CACHE_TTL_ANALYTICS", "3600"))
    
    # ===== SECURITY CONFIGURATION =====
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # ===== ENVIRONMENT CONFIGURATION =====
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # ===== API CONFIGURATION =====
    API_V1_STR: str = "/api"
    API_TITLE: str = "EdTech MVP API"
    API_DESCRIPTION: str = "Backend API for adaptive learning platform with spaced repetition"
    API_VERSION: str = "1.0.0"
    
    # ===== CORS CONFIGURATION =====
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list = ["*"]
    CORS_ALLOW_HEADERS: list = ["*"]
    
    class Config:
        """Pydantic Config"""
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    Using cache to avoid reloading on every request
    """
    return Settings()


# Export settings instance
settings = get_settings()
