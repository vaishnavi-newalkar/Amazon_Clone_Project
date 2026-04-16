"""
Cart Routes - Add, Update, Remove, List
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.cart_order import CartItem
from app.schemas.schemas import CartItemAdd, CartItemUpdate, CartItemResponse, CartSummary, MessageResponse

router = APIRouter()

FREE_SHIPPING_THRESHOLD = 499.0
SHIPPING_COST = 40.0


def calculate_cart_summary(items: list) -> dict:
    subtotal = sum(item.product.price * item.quantity for item in items)
    shipping = 0.0 if subtotal >= FREE_SHIPPING_THRESHOLD or subtotal == 0 else SHIPPING_COST
    return {
        "items": items,
        "item_count": sum(item.quantity for item in items),
        "subtotal": round(subtotal, 2),
        "shipping_cost": shipping,
        "total": round(subtotal + shipping, 2),
    }


@router.get("", response_model=CartSummary)
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current user's cart with all items and totals."""
    items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    return calculate_cart_summary(items)


@router.post("/add", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item_data: CartItemAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a product to cart or increase quantity if already present."""
    product = db.query(Product).filter(
        Product.id == item_data.product_id,
        Product.is_active == True,
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock < item_data.quantity:
        raise HTTPException(status_code=400, detail=f"Only {product.stock} units available")

    # Check if item already in cart
    existing = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == item_data.product_id,
    ).first()

    if existing:
        new_qty = existing.quantity + item_data.quantity
        if new_qty > product.stock:
            raise HTTPException(status_code=400, detail=f"Cannot exceed available stock ({product.stock})")
        existing.quantity = new_qty
        db.commit()
        db.refresh(existing)
        return existing

    cart_item = CartItem(
        user_id=current_user.id,
        product_id=item_data.product_id,
        quantity=item_data.quantity,
    )
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return cart_item


@router.put("/{item_id}", response_model=CartItemResponse)
def update_cart_item(
    item_id: int,
    update_data: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update quantity of a cart item."""
    item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if update_data.quantity > item.product.stock:
        raise HTTPException(status_code=400, detail="Quantity exceeds available stock")

    item.quantity = update_data.quantity
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", response_model=MessageResponse)
def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a specific item from cart."""
    item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()
    return {"message": "Item removed from cart"}


@router.delete("", response_model=MessageResponse)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove all items from cart."""
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Cart cleared"}
