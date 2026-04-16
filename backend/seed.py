"""
Database Seed Script
Populates the database with sample categories, products, and a test user.
Run: python seed.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.product import Product, Category
from app.models.cart_order import CartItem, Order, OrderItem, Wishlist
from app.core.security import get_password_hash

# Create all tables
Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        # Clear existing data
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(CartItem).delete()
        db.query(Wishlist).delete()
        db.query(Product).delete()
        db.query(Category).delete()
        db.query(User).delete()
        db.commit()
        print("[OK] Cleared existing data")

        # ── Categories ──────────────────────────────────────────────────────
        categories_data = [
            {"name": "Electronics",       "slug": "electronics",       "description": "Gadgets, phones, laptops, and more"},
            {"name": "Books",              "slug": "books",              "description": "Fiction, non-fiction, academic and more"},
            {"name": "Clothing",           "slug": "clothing",           "description": "Men, women, kids fashion"},
            {"name": "Home & Kitchen",     "slug": "home-kitchen",       "description": "Appliances, cookware, decor"},
            {"name": "Sports & Fitness",   "slug": "sports-fitness",     "description": "Equipment, apparel, accessories"},
            {"name": "Beauty & Personal",  "slug": "beauty-personal",    "description": "Skincare, makeup, grooming"},
            {"name": "Toys & Games",       "slug": "toys-games",         "description": "For kids and adults"},
            {"name": "Grocery",            "slug": "grocery",            "description": "Food, beverages, daily essentials"},
        ]

        categories = {}
        for c in categories_data:
            cat = Category(**c)
            db.add(cat)
            db.flush()
            categories[c["slug"]] = cat
        db.commit()
        print(f"[OK] Created {len(categories)} categories")

        # ── Products ─────────────────────────────────────────────────────────
        products_data = [
            # Electronics
            {
                "name": "Apple iPhone 15 Pro (256GB) - Natural Titanium",
                "description": "The iPhone 15 Pro features a strong and light aerospace-grade titanium design with a textured matte-glass back. It has a 6.1-inch Super Retina XDR display with ProMotion technology. Powered by the A17 Pro chip, it delivers unmatched performance. The 48MP main camera with second-generation sensor-shift optical image stabilization captures stunning photos.",
                "price": 134900, "original_price": 139900, "stock": 50, "brand": "Apple",
                "rating": 4.7, "review_count": 8432,
                "category_slug": "electronics",
                "images": [
                    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600",
                    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600",
                ],
                "specifications": {"Display": "6.1-inch OLED", "Chip": "A17 Pro", "Camera": "48MP", "Battery": "3274 mAh", "Storage": "256GB", "OS": "iOS 17"},
            },
            {
                "name": "Samsung Galaxy S24 Ultra 5G (512GB) - Titanium Black",
                "description": "Galaxy S24 Ultra features a 6.8-inch Dynamic AMOLED 2X display with 2600 nits peak brightness. Built-in S Pen for productivity. 200MP main camera with 100x Space Zoom. Snapdragon 8 Gen 3 processor. 5000mAh battery with 45W wired charging.",
                "price": 129999, "original_price": 134999, "stock": 35, "brand": "Samsung",
                "rating": 4.6, "review_count": 5621,
                "category_slug": "electronics",
                "images": [
                    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600",
                    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
                ],
                "specifications": {"Display": "6.8-inch AMOLED", "Chip": "Snapdragon 8 Gen 3", "Camera": "200MP", "Battery": "5000 mAh", "Storage": "512GB"},
            },
            {
                "name": "Apple MacBook Air 13-inch M3 Chip (8GB RAM, 256GB SSD)",
                "description": "MacBook Air with M3 chip is incredibly thin and light with up to 18 hours of battery life. The 13.6-inch Liquid Retina display with 500 nits brightness delivers a brilliant visual experience. M3 chip with 8-core CPU and 8-core GPU handles demanding workloads with ease.",
                "price": 114900, "original_price": 119900, "stock": 25, "brand": "Apple",
                "rating": 4.8, "review_count": 3204,
                "category_slug": "electronics",
                "images": [
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
                    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600",
                ],
                "specifications": {"Chip": "Apple M3", "RAM": "8GB", "Storage": "256GB SSD", "Display": "13.6-inch Liquid Retina", "Battery": "Up to 18 hours"},
            },
            {
                "name": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
                "description": "Industry-leading noise canceling with Auto NC Optimizer. Crystal clear hands-free calling with 8 microphones. Up to 30 hours battery life. Multipoint connection to connect to two devices simultaneously. Wear detection pauses music when headphones are removed.",
                "price": 29990, "original_price": 34990, "stock": 80, "brand": "Sony",
                "rating": 4.6, "review_count": 12045,
                "category_slug": "electronics",
                "images": [
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
                    "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600",
                ],
                "specifications": {"Driver": "30mm", "Battery": "30 hours", "Connectivity": "Bluetooth 5.2", "Weight": "250g", "Noise Canceling": "Yes"},
            },
            {
                "name": "Logitech MX Master 3S Wireless Mouse",
                "description": "MagSpeed electromagnetic scrolling is whisper quiet and 90% quieter. 8K DPI sensor works on any surface including glass. Connect via USB-C or Bluetooth. 70 days battery life. Customizable side buttons. Ergonomic design for all-day comfort.",
                "price": 9495, "original_price": 11995, "stock": 120, "brand": "Logitech",
                "rating": 4.7, "review_count": 6782,
                "category_slug": "electronics",
                "images": [
                    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600",
                ],
                "specifications": {"DPI": "200-8000", "Battery": "70 days", "Connectivity": "Bluetooth + USB", "Buttons": "7 customizable"},
            },
            # Books
            {
                "name": "Atomic Habits by James Clear - Paperback",
                "description": "A revolutionary system to get 1 percent better every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
                "price": 399, "original_price": 599, "stock": 200, "brand": "Penguin Random House",
                "rating": 4.8, "review_count": 45231,
                "category_slug": "books",
                "images": [
                    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
                    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
                ],
                "specifications": {"Pages": "320", "Language": "English", "Publisher": "Penguin Random House", "Edition": "Paperback"},
            },
            {
                "name": "The Psychology of Money by Morgan Housel",
                "description": "Timeless lessons on wealth, greed, and happiness. Doing well with money isn't necessarily about what you know. It's about how you behave. And behavior is hard to teach, even to really smart people.",
                "price": 349, "original_price": 499, "stock": 150, "brand": "Jaico Publishing",
                "rating": 4.7, "review_count": 32100,
                "category_slug": "books",
                "images": [
                    "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600",
                ],
                "specifications": {"Pages": "256", "Language": "English", "Publisher": "Jaico", "Edition": "Paperback"},
            },
            # Clothing
            {
                "name": "Levi's Men's 511 Slim Fit Jeans - Blue Denim",
                "description": "The Levi's 511 slim fit jeans sit below the waist with a slim fit through the thigh and a narrow leg opening. Made with flex fabric for ease of movement. Machine washable.",
                "price": 2699, "original_price": 4299, "stock": 90, "brand": "Levi's",
                "rating": 4.4, "review_count": 8903,
                "category_slug": "clothing",
                "images": [
                    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
                    "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600",
                ],
                "specifications": {"Fit": "Slim", "Material": "99% Cotton 1% Elastane", "Care": "Machine Wash", "Rise": "Regular"},
            },
            {
                "name": "Nike Air Max 270 Running Shoes - Men's",
                "description": "The Nike Air Max 270 delivers visible cushioning under every step with Max Air unit in the heel. Engineered mesh upper provides lightweight comfort and breathability. Rubber outsole with flex grooves for natural movement.",
                "price": 8995, "original_price": 11995, "stock": 60, "brand": "Nike",
                "rating": 4.5, "review_count": 15678,
                "category_slug": "clothing",
                "images": [
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
                    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600",
                ],
                "specifications": {"Material": "Mesh/Synthetic", "Sole": "Rubber", "Closure": "Lace-up", "Technology": "Air Max 270"},
            },
            # Home & Kitchen
            {
                "name": "Instant Pot Duo 7-in-1 Electric Pressure Cooker 5.7L",
                "description": "7-in-1 multi-use programmable pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer. Stainless steel cooking pot. 14 smart programs. Energy efficient - uses 70% less energy than traditional cooking.",
                "price": 7999, "original_price": 9999, "stock": 45, "brand": "Instant Pot",
                "rating": 4.6, "review_count": 23456,
                "category_slug": "home-kitchen",
                "images": [
                    "https://images.unsplash.com/photo-1585515656973-dc06f58e0a3d?w=600",
                ],
                "specifications": {"Capacity": "5.7L", "Programs": "14", "Wattage": "1000W", "Material": "Stainless Steel"},
            },
            {
                "name": "Philips Air Fryer HD9200/90 (4.1L) - Black",
                "description": "Philips Air Fryer with Rapid Air Technology circulates hot air rapidly for crispy food with up to 90% less fat. 4.1L capacity perfect for family meals. Timer up to 30 minutes with auto shut-off. Easy clean dishwasher safe drawer and basket.",
                "price": 5999, "original_price": 8495, "stock": 55, "brand": "Philips",
                "rating": 4.4, "review_count": 9871,
                "category_slug": "home-kitchen",
                "images": [
                    "https://images.unsplash.com/photo-1648391892795-c0cf0cd5cd98?w=600",
                ],
                "specifications": {"Capacity": "4.1L", "Wattage": "1400W", "Timer": "30 min", "Fat Reduction": "Up to 90%"},
            },
            # Sports
            {
                "name": "Boldfit Gym Bag - Large Sports Duffel Bag with Shoe Compartment",
                "description": "Large 55L capacity gym bag with separate wet/dry compartment for shoes. Multiple pockets for organization. Durable water-resistant material. Padded shoulder strap and carry handles. Perfect for gym, travel, sports.",
                "price": 899, "original_price": 1799, "stock": 200, "brand": "Boldfit",
                "rating": 4.3, "review_count": 5432,
                "category_slug": "sports-fitness",
                "images": [
                    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
                ],
                "specifications": {"Capacity": "55L", "Material": "Polyester", "Compartments": "5", "Water Resistant": "Yes"},
            },
            {
                "name": "Yoga Mat 6mm Anti-Slip with Carry Strap - Premium TPE",
                "description": "Premium 6mm TPE yoga mat with superior grip on both sides. Eco-friendly, odor-free TPE material. Alignment lines for proper positioning. Lightweight at 1.1kg. Includes carry strap. Size: 183cm x 61cm.",
                "price": 799, "original_price": 1499, "stock": 180, "brand": "Fitsy",
                "rating": 4.5, "review_count": 7654,
                "category_slug": "sports-fitness",
                "images": [
                    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600",
                ],
                "specifications": {"Thickness": "6mm", "Material": "TPE", "Size": "183x61cm", "Weight": "1.1kg"},
            },
            # Beauty
            {
                "name": "Mamaearth Vitamin C Face Serum 30ml with Turmeric",
                "description": "Mamaearth Vitamin C Face Serum brightens and evens skin tone. Enriched with 15% Vitamin C and Turmeric. Reduces dark spots, blemishes and pigmentation. Lightweight and fast-absorbing formula. Dermatologically tested. Free from parabens and sulfates.",
                "price": 399, "original_price": 599, "stock": 300, "brand": "Mamaearth",
                "rating": 4.3, "review_count": 18932,
                "category_slug": "beauty-personal",
                "images": [
                    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600",
                ],
                "specifications": {"Volume": "30ml", "Key Ingredient": "Vitamin C + Turmeric", "Skin Type": "All", "Paraben Free": "Yes"},
            },
            # Toys
            {
                "name": "LEGO Classic Large Creative Brick Box 10698 (790 Pieces)",
                "description": "Large brick box with 790 classic LEGO bricks in 33 colors. Build anything imaginable! Ideas booklet included with 8 building inspirations. Compatible with all LEGO sets. Suitable for ages 4+.",
                "price": 4299, "original_price": 5499, "stock": 70, "brand": "LEGO",
                "rating": 4.8, "review_count": 11234,
                "category_slug": "toys-games",
                "images": [
                    "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600",
                ],
                "specifications": {"Pieces": "790", "Age": "4+", "Colors": "33", "Theme": "Classic"},
            },
            # Grocery
            {
                "name": "Tata Tea Premium Leaf Tea 500g",
                "description": "Tata Tea Premium is made from rich Assam tea leaves, blended to give you a refreshing cup. The perfect blend of strong flavor and invigorating freshness. Makes approximately 250 cups.",
                "price": 249, "original_price": 280, "stock": 500, "brand": "Tata Tea",
                "rating": 4.5, "review_count": 32100,
                "category_slug": "grocery",
                "images": [
                    "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600",
                ],
                "specifications": {"Weight": "500g", "Type": "Leaf Tea", "Origin": "Assam", "Cups": "~250"},
            },
        ]

        for pd in products_data:
            cat_slug = pd.pop("category_slug")
            product = Product(**pd, category_id=categories[cat_slug].id)
            db.add(product)

        db.commit()
        print(f"[OK] Created {len(products_data)} products")

        # ── Test User ────────────────────────────────────────────────────────
        test_user = User(
            email="test@example.com",
            full_name="John Doe",
            hashed_password=get_password_hash("password123"),
        )
        db.add(test_user)
        db.commit()
        print("[OK] Created test user: test@example.com / password123")

        print("\n[SUCCESS] Database seeded successfully!")
        print("   Products:", len(products_data))
        print("   Categories:", len(categories_data))
        print("   Test user: test@example.com / password123")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
