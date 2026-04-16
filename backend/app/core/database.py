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

# Remove ssl-mode parameter that pymysql doesn't understand
# and configure SSL via connect_args instead
import re
ssl_required = False
if "ssl-mode" in db_url or "ssl_mode" in db_url:
    ssl_required = True
    db_url = re.sub(r'[?&](ssl-mode|ssl_mode)=[^&]*', '', db_url)
    # Clean up leftover ? or & at the end
    db_url = db_url.rstrip('?').rstrip('&')

# Build connect_args for SSL if needed
# Aiven uses self-signed certificates, so we create an SSL context
# that encrypts the connection but accepts self-signed certs
connect_args = {}
if ssl_required or "aivencloud" in db_url:
    import ssl as ssl_module
    ssl_ctx = ssl_module.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl_module.CERT_NONE
    connect_args["ssl"] = ssl_ctx

# Create SQLAlchemy engine
engine = create_engine(
    db_url,
    pool_pre_ping=True,          # Reconnect on stale connections
    pool_recycle=3600,           # Recycle connections every hour
    echo=settings.DEBUG,         # Log SQL queries in debug mode
    connect_args=connect_args,
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
