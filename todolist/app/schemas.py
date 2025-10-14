from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

# --- Todo Schemas ---
class TodoBase(BaseModel):
    title: str

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None

class Todo(TodoBase):
    id: int
    completed: bool
    owner_id: int

    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(
        ...,
        min_length=8,
        max_length=72,
        description="비밀번호는 8자 이상, 72자 이하여야 합니다."
    )

class User(UserBase):
    id: int
    todos: List[Todo] = []

    class Config:
        from_attributes = True # SQLAlchemy 모델을 Pydantic 모델로 변환

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None
