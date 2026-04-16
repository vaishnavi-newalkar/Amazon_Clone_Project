"""
SQLAlchemy ORM Models - Product & Category
"""
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), unique=True, nullable=False, index=True)
    slug        = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    image_url   = Column(String(500), nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    products    = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(500), nullable=False, index=True)
    description   = Column(Text, nullable=True)
    price         = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)  # For showing discounts
    stock         = Column(Integer, default=0)
    brand         = Column(String(200), nullable=True)
    rating        = Column(Float, default=0.0)
    review_count  = Column(Integer, default=0)
    is_active     = Column(Boolean, default=True)

    # Product images stored as JSON array of URLs
    images        = Column(JSON, default=list)

    # Specifications stored as JSON key-value pairs
    specifications = Column(JSON, default=dict)

    # Foreign Keys
    category_id   = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)

    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    category      = relationship("Category", back_populates="products")
    cart_items    = relationship("CartItem",  back_populates="product")
    order_items   = relationship("OrderItem", back_populates="product")
    wishlist      = relationship("Wishlist",  back_populates="product")

    @property
    def discount_percent(self):
        """Calculate discount percentage if original price exists."""
        if self.original_price and self.original_price > self.price:
            return round((1 - self.price / self.original_price) * 100)
        return 0

    @property
    def in_stock(self):
        return self.stock > 0
