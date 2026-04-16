"""
SQLAlchemy ORM Models - Cart, Order, Wishlist
"""
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class CartItem(Base):
    __tablename__ = "cart_items"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity   = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user       = relationship("User",    back_populates="cart_items")
    product    = relationship("Product", back_populates="cart_items")


class OrderStatus(str, enum.Enum):
    PENDING    = "pending"
    CONFIRMED  = "confirmed"
    PROCESSING = "processing"
    SHIPPED    = "shipped"
    DELIVERED  = "delivered"
    CANCELLED  = "cancelled"


class Order(Base):
    __tablename__ = "orders"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status           = Column(Enum(OrderStatus), default=OrderStatus.CONFIRMED)

    # Shipping details (stored as flat fields for simplicity)
    shipping_name    = Column(String(255), nullable=False)
    shipping_phone   = Column(String(20), nullable=False)
    shipping_address = Column(Text, nullable=False)
    shipping_city    = Column(String(100), nullable=False)
    shipping_state   = Column(String(100), nullable=False)
    shipping_pincode = Column(String(10), nullable=False)

    # Order financials
    subtotal         = Column(Float, nullable=False)
    shipping_cost    = Column(Float, default=0.0)
    total            = Column(Float, nullable=False)

    # Payment
    payment_method   = Column(String(50), default="COD")

    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user             = relationship("User",      back_populates="orders")
    items            = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id          = Column(Integer, primary_key=True, index=True)
    order_id    = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id  = Column(Integer, ForeignKey("products.id"), nullable=False)

    # Snapshot of product details at time of order (prices can change later)
    product_name  = Column(String(500), nullable=False)
    product_image = Column(String(500), nullable=True)
    price         = Column(Float, nullable=False)
    quantity      = Column(Integer, nullable=False)

    # Relationships
    order    = relationship("Order",   back_populates="items")
    product  = relationship("Product", back_populates="order_items")


class Wishlist(Base):
    __tablename__ = "wishlist"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user       = relationship("User",    back_populates="wishlist")
    product    = relationship("Product", back_populates="wishlist")
