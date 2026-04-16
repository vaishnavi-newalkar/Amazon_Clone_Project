import os
import sys

from sqlalchemy import text
from app.core.database import SessionLocal, engine
from dotenv import load_dotenv

load_dotenv(override=True)

def migrate():
    try:
        with engine.begin() as conn:
            # Check if columns exist
            result = conn.execute(text("SHOW COLUMNS FROM users"))
            columns = [row[0] for row in result.fetchall()]

            if 'phone' not in columns:
                print("Adding phone column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(50) NULL"))
            if 'address' not in columns:
                print("Adding address column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN address VARCHAR(500) NULL"))
            if 'city' not in columns:
                print("Adding city column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN city VARCHAR(100) NULL"))
            if 'state' not in columns:
                print("Adding state column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN state VARCHAR(100) NULL"))
            if 'pincode' not in columns:
                print("Adding pincode column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN pincode VARCHAR(20) NULL"))
            
            print("Migration successful! Added missing columns to users table.")
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    migrate()
