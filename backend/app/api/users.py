# linking login/reg page - kai

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import User
from pydantic import BaseModel
import bcrypt
import re
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List

router = APIRouter()

# JWT setting
SECRET_KEY = "your-secret-key" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Password hashing
def hash_password(password: str) -> str:
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        plain_bytes = plain_password.encode('utf-8')[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception:
        return False

# Pydantic Models
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "resident"
    unit_no: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserDashboardResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str

    class Config:
        from_attributes = True

# Helper Functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).filter(User.email == token_data.email))
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
    return user

async def require_hoa_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["hoa_admin", "head_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action."
        )
    return current_user

# AUTH ENDPOINTS
@router.post("/auth/register")
async def register_user(user: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == user.email))
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", user.email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    if len(user.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    hashed_password = hash_password(user.password)
    new_user = User(
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        role=user.role,
        unit_no=user.unit_no,
        email_verified=False,
        hoa_approved=False
    )

    db.add(new_user)
    await db.commit() 
    await db.refresh(new_user) 
    return {
        "message": "User registered successfully",
        "user": {
            "user_id": new_user.user_id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role,
        }
    }

@router.post("/auth/login")
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    
    result = await db.execute(select(User).filter(User.email == form_data.username))
    user = result.scalars().first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.user_id}, 
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user.user_id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "unit_no": user.unit_no
        }
    }

@router.get("/users/")
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(User))
    users = result.scalars().all()

    return {
        "count": len(users), 
        "users": [
            {
                "id": u.user_id,
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role,
                "hoa_approved": u.hoa_approved,
                "unit_no": u.unit_no
            } for u in users
        ]
    }

@router.get("/users/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.user_id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "unit_no": current_user.unit_no,
        "email_verified": current_user.email_verified,
        "hoa_approved": current_user.hoa_approved
    }

@router.put("/users/me")
async def update_current_user(
    user_update: UserUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_update.email != current_user.email:
        
        result = await db.execute(select(User).filter(User.email == user_update.email))
        existing_user = result.scalars().first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered by another account")
        
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", user_update.email):
            raise HTTPException(status_code=400, detail="Invalid email format")

    current_user.full_name = user_update.full_name
    current_user.email = user_update.email
    if user_update.phone is not None:
        current_user.phone = user_update.phone

    await db.commit() 
    await db.refresh(current_user) 

    return {
        "id": current_user.user_id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "unit_no": current_user.unit_no,
        "email_verified": current_user.email_verified,
        "hoa_approved": current_user.hoa_approved
    }

@router.put("/users/me/password")
async def update_password(
    passwords: PasswordUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(passwords.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    if len(passwords.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters long")

    current_user.password_hash = hash_password(passwords.new_password)
    await db.commit() 

    return {"message": "Password updated successfully"}

# HOA Admin Dashboard endpoints
@router.get("/users/pending")
async def get_pending_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hoa_admin)
):
    result = await db.execute(select(User).filter(User.hoa_approved == False))
    pending_users = result.scalars().all()
    
    return [
        {
            "id": u.user_id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role
        } for u in pending_users
    ]

@router.get("/users/approved")
async def get_approved_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hoa_admin)
):
    result = await db.execute(select(User).filter(User.hoa_approved == True))
    approved_users = result.scalars().all()
    
    return [
        {
            "id": u.user_id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role
        } for u in approved_users
    ]

@router.post("/users/{user_id}/approve")
async def approve_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hoa_admin)
):
    result = await db.execute(select(User).filter(User.user_id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hoa_approved = True
    await db.commit() 
    await db.refresh(user) 
    
    return {"message": "User approved successfully"}

@router.post("/users/{user_id}/reject")
async def reject_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hoa_admin)
):
    
    result = await db.execute(select(User).filter(User.user_id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.delete(user) 
    await db.commit() 
    
    return {"message": "User rejected and deleted successfully"}

@router.get("/users/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
   
    result = await db.execute(select(User).filter(User.user_id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user