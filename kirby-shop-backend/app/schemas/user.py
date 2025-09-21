"""
사용자 관련 Pydantic 스키마
"""

from datetime import datetime, date
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    birth_date: Optional[date] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str
    agree_marketing: bool = False

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[date] = None
    address: Optional[str] = None
    profile_image: Optional[str] = None

class UserResponse(UserBase):
    id: int
    grade: str
    points: int
    order_count: int
    join_date: datetime
    profile_image: Optional[str] = None
    role: str
    is_active: bool
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
