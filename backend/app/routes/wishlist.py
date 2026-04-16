"""
Wishlist Routes - Add, Remove, List
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.cart_order import Wishlist
from app.schemas.schemas import WishlistItemResponse, MessageResponse

router = APIRouter()


@router.get("", response_model=List[WishlistItemResponse])
def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all wishlist items for current user."""
    return db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()


@router.post("/{product_id}", response_model=WishlistItemResponse, status_code=201)
def add_to_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a product to wishlist. Idempotent - returns existing if already present."""
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id,
    ).first()

    if existing:
        return existing

    item = Wishlist(user_id=current_user.id, product_id=product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{product_id}", response_model=MessageResponse)
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a product from wishlist."""
    item = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not in wishlist")

    db.delete(item)
    db.commit()
    return {"message": "Removed from wishlist"}
