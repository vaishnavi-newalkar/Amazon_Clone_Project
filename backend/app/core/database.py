"""
Database configuration using SQLAlchemy ORM
Handles MySQL connection and session management
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Ensure the URL always uses the pymysql driver
# (Aiven / Railway may provide mysql:// which defaults to MySQLdb)
db_url = settings.DATABASE_URL
if db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

# Create SQLAlchemy engine
engine = create_engine(
    db_url,
    pool_pre_ping=True,          # Reconnect on stale connections
    pool_recycle=3600,           # Recycle connections every hour
    echo=settings.DEBUG,         # Log SQL queries in debug mode
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()


def get_db():
    """
    Dependency injection for database sessions.
    Yields a session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
