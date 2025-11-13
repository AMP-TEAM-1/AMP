# Pydantic 스키마를 정의하여 데이터 유효성 검사 및 직렬화 수행

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
    date: date # 🥕 날짜 필드 추가

class TodoCreate(TodoBase):
    category_ids: Optional[List[int]] = None # 🥕 카테고리 ID 목록 추가

    # ⏰ 알람 시간 필드 추가
    # DB에 String으로 저장할 경우 Optional[str]
    # DB에 Time으로 저장할 경우 Optional[time]
    alarm_time: Optional[str] = None

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None
    category_ids: Optional[List[int]] = None # 🥕 카테고리 ID 목록으로 수정
    date: Optional[date] = None # 🥕 날짜도 수정 가능하도록 추가

class Todo(TodoBase):
    id: int
    completed: bool
    owner_id: int
    categories: List[Category] = [] # 🥕 연결된 카테고리 정보 포함
    alarm_time: Optional[time] = None

    class Config:
        from_attributes = True

# --- Item & Inventory Schemas ---
class ItemBase(BaseModel):
    name: str
    price: int
    item_type: str # 'hat' 또는 'accessory'
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
        # 🔥 응답 시 alias 필드명 사용 (id → item_id, item_type → type)
        by_alias = True # 별칭 포맷팅 설정

class Item(ItemBase):
    id: int
    class Config:
        from_attributes = True

class Inventory(BaseModel):
    # 인벤토리 목록 조회 시 필요한 정보
    item: Item # Item 전체 정보 포함
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

    # 🥕 당근 갯수 필드 추가
    carrot_balance: int 
    
    # 👒 현재 장착 정보 필드 추가 (인벤토리와의 빠른 조회를 위해)
    equipped_hat_id: Optional[int] = None
    equipped_acc_id: Optional[int] = None

    # 인벤토리 목록을 포함할 경우 (선택사항)
    inventory: List[Inventory] = []

    class Config:
        from_attributes = True # SQLAlchemy 모델을 Pydantic 모델로 변환

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class PurchaseRequest(BaseModel):
    item_id: int