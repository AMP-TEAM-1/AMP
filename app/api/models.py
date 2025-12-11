from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Time, DATETIME, Table
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    todos = relationship("Todo", back_populates="owner")
    carrot_balance = Column(Integer, default=0, nullable=False) 

    equipped_hat_id = Column(Integer, ForeignKey("items.id"), nullable=True)
    equipped_acc_id = Column(Integer, ForeignKey("items.id"), nullable=True)
    equipped_background_id = Column(Integer, ForeignKey("items.id"), nullable=True)

    # 인벤토리와 관계 설정 (역참조)
    inventory = relationship("Inventory", back_populates="owner")

# 할일-카테고리 다대다 관계를 위한 연결 테이블
todo_category_association = Table(
    'todo_category_association', Base.metadata,
    Column('todo_id', Integer, ForeignKey('todos.id'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id'), primary_key=True)
)

class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True) 
    title = Column(String, index=True) 
    completed = Column(Boolean, default=False) 
    owner_id = Column(Integer, ForeignKey("users.id")) 
    date = Column(DATETIME, index=True, nullable=False) 

    owner = relationship("User", back_populates="todos") 
    categories = relationship(
        "Category",
        secondary=todo_category_association,
        back_populates="todos"
    )

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User")
    todos = relationship("Todo", secondary=todo_category_association, back_populates="categories")

class Item(Base):
    """상점 물품의 정보(가격, 타입, 이미지 등)를 저장"""
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Integer, nullable=False) 
    item_type = Column(String, nullable=False) 
    image_url = Column(String) 
    
    # 이 물품을 소유한 인벤토리 목록 역참조
    owners = relationship("Inventory", back_populates="item")

class Inventory(Base):
    """사용자가 소유한 물품 목록 및 장착 여부를 저장"""
    __tablename__ = "inventories"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # 외래 키 (FK)
    user_id = Column(Integer, ForeignKey("users.id"))
    item_id = Column(Integer, ForeignKey("items.id"))
    
    is_equipped = Column(Boolean, default=False) # 현재 장착 여부
    
    # 관계 설정
    owner = relationship("User", back_populates="inventory")
    item = relationship("Item", back_populates="owners")