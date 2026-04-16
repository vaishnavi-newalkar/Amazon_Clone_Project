"""
Application Configuration
Loads settings from environment variables with sensible defaults
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/amazon_clone"

    # JWT Auth
    SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # App
    DEBUG: bool = True
    APP_NAME: str = "Amazon Clone"

    # Email (SMTP)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: str = "noreply@amazonclone.com"
    EMAIL_ENABLED: bool = False  # Set to True with valid SMTP credentials

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

