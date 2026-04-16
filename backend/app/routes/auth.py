"""
Authentication Routes - Signup, Login
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.models.user import User
from app.schemas.schemas import UserCreate, UserLogin, Token, UserResponse, UserUpdate

router = APIRouter()


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    Returns JWT token on success.
    """
    # Check if email already exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    # Create new user with hashed password
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT token.
    """
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return profile of the currently authenticated user."""
    return current_user

@router.put("/me", response_model=UserResponse)
def update_me(update_data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update profile details of the currently authenticated user."""
    update_dict = update_data.model_dump(exclude_unset=True)
    
    if "password" in update_dict and update_dict["password"]:
        update_dict["hashed_password"] = get_password_hash(update_dict.pop("password"))
        
    for key, value in update_dict.items():
        setattr(current_user, key, value)
        
    db.commit()
    db.refresh(current_user)
    return current_user
