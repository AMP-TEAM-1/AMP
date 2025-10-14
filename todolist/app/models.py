from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    todos = relationship("Todo", back_populates="owner")


class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True) # 고유 항목 ID
    title = Column(String, index=True) # 할일 제목
    completed = Column(Boolean, default=False) # 완료 여부
    owner_id = Column(Integer, ForeignKey("users.id")) # 소유자 ID

    owner = relationship("User", back_populates="todos") # 소유자 정보
