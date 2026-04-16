"""
Product Routes - List, Search, Filter, Detail
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional, List

from app.core.database import get_db
from app.models.product import Product, Category
from app.schemas.schemas import ProductDetail, ProductCard, PaginatedProducts

router = APIRouter()


@router.get("", response_model=PaginatedProducts)
def list_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by name or description"),
    category_id: Optional[int] = Query(None),
    category_slug: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    sort_by: Optional[str] = Query("created_at", enum=["price_asc", "price_desc", "rating", "created_at"]),
    db: Session = Depends(get_db),
):
    """
    List products with optional search, category filter, price range, and sorting.
    Returns paginated results.
    """
    query = db.query(Product).filter(Product.is_active == True)

    # Full-text search on name and description
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
                Product.brand.ilike(search_term),
            )
        )

    # Filter by category (by ID or slug)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    elif category_slug:
        cat = db.query(Category).filter(Category.slug == category_slug).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)

    # Price range filter
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # Sorting
    sort_map = {
        "price_asc":  Product.price.asc(),
        "price_desc": Product.price.desc(),
        "rating":     Product.rating.desc(),
        "created_at": Product.created_at.desc(),
    }
    query = query.order_by(sort_map.get(sort_by, Product.created_at.desc()))

    total = query.count()
    products = query.offset((page - 1) * per_page).limit(per_page).all()

    return PaginatedProducts(
        items=products,
        total=total,
        page=page,
        per_page=per_page,
        pages=(total + per_page - 1) // per_page,
    )


@router.get("/featured", response_model=List[ProductCard])
def get_featured_products(limit: int = 8, db: Session = Depends(get_db)):
    """Return top-rated active products for the homepage hero section."""
    products = (
        db.query(Product)
        .filter(Product.is_active == True, Product.stock > 0)
        .order_by(Product.rating.desc(), Product.review_count.desc())
        .limit(limit)
        .all()
    )
    return products


@router.get("/{product_id}", response_model=ProductDetail)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get full product details by ID."""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True,
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found",
        )
    return product
