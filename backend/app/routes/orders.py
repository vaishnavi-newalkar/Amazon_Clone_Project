"""
Order Routes - Place Order, Order History, Order Detail
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.cart_order import CartItem, Order, OrderItem, OrderStatus
from app.models.product import Product
from app.schemas.schemas import ShippingAddress, OrderResponse
from app.services.email_service import send_order_confirmation_email

router = APIRouter()

FREE_SHIPPING_THRESHOLD = 499.0
SHIPPING_COST = 40.0


@router.post("/place", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    address: ShippingAddress,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Place an order from current cart items.
    - Validates stock availability
    - Creates order and order items
    - Clears cart
    - Sends confirmation email (background task)
    """
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Validate all items are still in stock
    for item in cart_items:
        if item.product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"'{item.product.name}' has only {item.product.stock} units left",
            )

    # Calculate totals
    subtotal = sum(item.product.price * item.quantity for item in cart_items)
    shipping_cost = 0.0 if subtotal >= FREE_SHIPPING_THRESHOLD else SHIPPING_COST
    total = subtotal + shipping_cost

    # Create the order
    order = Order(
        user_id=current_user.id,
        status=OrderStatus.CONFIRMED,
        shipping_name=address.shipping_name,
        shipping_phone=address.shipping_phone,
        shipping_address=address.shipping_address,
        shipping_city=address.shipping_city,
        shipping_state=address.shipping_state,
        shipping_pincode=address.shipping_pincode,
        payment_method=address.payment_method,
        subtotal=round(subtotal, 2),
        shipping_cost=shipping_cost,
        total=round(total, 2),
    )
    db.add(order)
    db.flush()  # Get order ID without committing

    # Create order items (snapshot product details)
    email_items = []
    for item in cart_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            product_name=item.product.name,
            product_image=item.product.images[0] if item.product.images else None,
            price=item.product.price,
            quantity=item.quantity,
        )
        db.add(order_item)

        # Reduce stock
        item.product.stock -= item.quantity

        email_items.append({
            "name": item.product.name,
            "quantity": item.quantity,
            "price": item.product.price * item.quantity,
        })

    # Clear cart
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()

    db.commit()
    db.refresh(order)

    # Send confirmation email in background (non-blocking)
    shipping_addr_str = (
        f"{address.shipping_address}, {address.shipping_city}, "
        f"{address.shipping_state} - {address.shipping_pincode}"
    )
    background_tasks.add_task(
        send_order_confirmation_email,
        to_email=current_user.email,
        user_name=current_user.full_name,
        order_id=order.id,
        order_total=order.total,
        items=email_items,
        shipping_address=shipping_addr_str,
    )

    return order


@router.get("", response_model=List[OrderResponse])
def get_order_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all orders for current user, newest first."""
    return (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific order by ID (must belong to current user)."""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id,
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cancel an order. Only allowed when status is 'confirmed' or 'processing'."""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id,
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    cancellable_statuses = [OrderStatus.CONFIRMED, OrderStatus.PROCESSING]
    if order.status not in cancellable_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Order cannot be cancelled — it is already '{order.status.value}'"
        )

    # Restore product stock for each item
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock += item.quantity

    order.status = OrderStatus.CANCELLED
    db.commit()
    db.refresh(order)
    return order
