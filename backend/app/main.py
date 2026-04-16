"""
Amazon Clone - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.database import engine, Base
from app.routes import auth, products, cart, wishlist, orders, categories

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Amazon Clone API",
    description="E-Commerce Platform API built with FastAPI",
    version="1.0.0",
)

# CORS configuration - allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for product images
os.makedirs("static/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Register all routers
app.include_router(auth.router,       prefix="/api/auth",       tags=["Authentication"])
app.include_router(products.router,   prefix="/api/products",   tags=["Products"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(cart.router,       prefix="/api/cart",       tags=["Cart"])
app.include_router(wishlist.router,   prefix="/api/wishlist",   tags=["Wishlist"])
app.include_router(orders.router,     prefix="/api/orders",     tags=["Orders"])


@app.get("/")
def root():
    return {"message": "Amazon Clone API is running!", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
