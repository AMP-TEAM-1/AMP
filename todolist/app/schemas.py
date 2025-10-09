from pydantic import BaseModel, EmailStr, Field

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

    class Config:
        from_attributes = True # SQLAlchemy 모델을 Pydantic 모델로 변환

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None
