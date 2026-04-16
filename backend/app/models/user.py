"""
SQLAlchemy ORM Models - User
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id           = Column(Integer, primary_key=True, index=True)
    email        = Column(String(255), unique=True, index=True, nullable=False)
    full_name    = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active    = Column(Boolean, default=True)
    phone        = Column(String(50), nullable=True)
    address      = Column(String(500), nullable=True)
    city         = Column(String(100), nullable=True)
    state        = Column(String(100), nullable=True)
    pincode      = Column(String(20), nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    cart_items   = relationship("CartItem",  back_populates="user", cascade="all, delete-orphan")
    orders       = relationship("Order",     back_populates="user")
    wishlist     = relationship("Wishlist",  back_populates="user", cascade="all, delete-orphan")
