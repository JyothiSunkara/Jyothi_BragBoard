from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


# ===== User Schemas =====
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    department: str
    role: str = "employee"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserProfile(BaseModel):
    id: int
    username: str
    email: str
    department: str
    role: str
    joined_at: datetime
    
    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    department: str
    role: str

    class Config:
        from_attributes = True



# ===== ShoutOut Schemas =====
class ShoutOutCreate(BaseModel):
    title: str
    message: str
    receiver_id: int
    tagged_user_ids: Optional[List[int]] = []
    category: str
    is_public: str = "public"


class ShoutOutResponse(BaseModel):
    id: int
    title: str
    message: str
    giver_name: str
    receiver_name: str
    giver_department: str
    receiver_department: str
    tagged_users: List[UserOut] = []
    category: str
    is_public: str
    created_at: datetime

    class Config:
        from_attributes = True


class DepartmentStats(BaseModel):
    department: str
    total_shoutouts: int
    shoutouts_given: int
    shoutouts_received: int
    
    class Config:
        from_attributes = True