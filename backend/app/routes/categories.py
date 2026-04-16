"""
Category Routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.product import Category
from app.schemas.schemas import CategoryResponse

router = APIRouter()


@router.get("", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    """Return all product categories."""
    return db.query(Category).order_by(Category.name).all()
