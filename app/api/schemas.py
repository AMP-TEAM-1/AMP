from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import time, date

# --- Category Schemas ---
class CategoryBase(BaseModel):
    text: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    class Config:
        from_attributes = True

# --- Todo Schemas ---
class TodoBase(BaseModel):
    title: str
    date: date 

class TodoCreate(TodoBase):
    category_ids: Optional[List[int]] = None 

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None
    category_ids: Optional[List[int]] = None 
    date: Optional[date] = None 

class Todo(TodoBase):
    id: int
    completed: bool
    owner_id: int
    categories: List[Category] = [] 

    class Config:
        from_attributes = True

# --- Item & Inventory Schemas ---
class ItemBase(BaseModel):
    name: str
    price: int
    item_type: str 
    image_url: str

class ItemResponse(BaseModel):
    name: str
    price: int
    image_url: str
    item_id: int = Field(..., alias='id')
    type: str = Field(..., alias='item_type')
    class Config:
        from_attributes = True
        populate_by_name = True
        # alias 필드명 사용 (id → item_id, item_type → type)
        by_alias = True # 별칭 포맷팅 설정

class Item(ItemBase):
    id: int
    class Config:
        from_attributes = True

class Inventory(BaseModel):
    # 인벤토리 목록 조회 시 필요한 정보
    item: ItemResponse 
    is_equipped: bool
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
    carrot_balance: int 
    equipped_hat_id: Optional[int] = None
    equipped_acc_id: Optional[int] = None

    inventory: List[Inventory] = []

    class Config:
        from_attributes = True 

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class PurchaseRequest(BaseModel):
    item_id: int