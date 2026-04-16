"""
Pydantic Schemas - Request/Response validation for all endpoints
"""
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Any, Dict
from datetime import datetime
from enum import Enum


# ─────────────────────────── AUTH SCHEMAS ────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─────────────────────────── CATEGORY SCHEMAS ────────────────────────────────

class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


# ─────────────────────────── PRODUCT SCHEMAS ─────────────────────────────────

class ProductCard(BaseModel):
    """Minimal product data for listing cards"""
    id: int
    name: str
    price: float
    original_price: Optional[float] = None
    discount_percent: int = 0
    rating: float
    review_count: int
    images: List[str] = []
    stock: int
    in_stock: bool
    brand: Optional[str] = None
    category_id: int
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True


class ProductDetail(ProductCard):
    """Full product data for detail page"""
    description: Optional[str] = None
    specifications: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────── CART SCHEMAS ────────────────────────────────────

class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = 1

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v):
        if v < 1:
            raise ValueError("Quantity must be at least 1")
        return v


class CartItemUpdate(BaseModel):
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v):
        if v < 1:
            raise ValueError("Quantity must be at least 1")
        return v


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductCard

    class Config:
        from_attributes = True


class CartSummary(BaseModel):
    items: List[CartItemResponse]
    item_count: int
    subtotal: float
    shipping_cost: float
    total: float


# ─────────────────────────── ORDER SCHEMAS ───────────────────────────────────

class ShippingAddress(BaseModel):
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_pincode: str
    payment_method: str = "COD"

    @field_validator("shipping_pincode")
    @classmethod
    def validate_pincode(cls, v):
        if not v.isdigit() or len(v) != 6:
            raise ValueError("Pincode must be a 6-digit number")
        return v


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_image: Optional[str] = None
    price: float
    quantity: int

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    status: str
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_pincode: str
    payment_method: str
    subtotal: float
    shipping_cost: float
    total: float
    items: List[OrderItemResponse]
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────── WISHLIST SCHEMAS ────────────────────────────────

class WishlistItemResponse(BaseModel):
    id: int
    product_id: int
    product: ProductCard
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────── GENERIC SCHEMAS ─────────────────────────────────

class MessageResponse(BaseModel):
    message: str


class PaginatedProducts(BaseModel):
    items: List[ProductCard]
    total: int
    page: int
    per_page: int
    pages: int
