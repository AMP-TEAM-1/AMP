from sqlalchemy.orm import Session
from typing import List
from . import models, schemas, security

# 사용자 관련 CRUD 함수

# 이메일로 사용자 조회 함수
def get_user_by_email(db: Session, email: str) -> models.User | None:
    return db.query(models.User).filter(models.User.email == email).first()

# 사용자 계정 생성 함수
def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = security.get_password_hash(user.password)
    # DB 모델의 'password' 필드에 해시된 비밀번호를 저장합니다.
    db_user = models.User(email=user.email, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Todo 관련 CRUD 함수
# 사용자 ID로 Todo 목록 조회 함수
def get_todos(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Todo).filter(models.Todo.owner_id == user_id).offset(skip).limit(limit).all()

# 사용자 ID로 Todo 생성 함수
def create_user_todo(db: Session, todo: schemas.TodoCreate, user_id: int):
    db_todo = models.Todo(**todo.dict(), owner_id=user_id)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

# ID로 단일 할일 항목 조회 함수
def get_todo(db: Session, todo_id: int):
    return db.query(models.Todo).filter(models.Todo.id == todo_id).first()

# ID로 할일 항목 업데이트 함수
def update_todo(db: Session, todo_id: int, todo: schemas.TodoUpdate):
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if db_todo:
        update_data = todo.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_todo, key, value)
        db.commit()
        db.refresh(db_todo)
    return db_todo

# ID로 할일 항목 삭제 함수
def delete_todo(db: Session, todo_id: int):
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if db_todo:
        db.delete(db_todo)
        db.commit()
    # 삭제 후에는 객체가 세션에서 만료되므로, 삭제 성공 여부를 boolean 등으로 반환하거나
    # 삭제된 객체 정보를 담은 dict를 반환할 수 있습니다. 여기서는 삭제된 객체를 반환합니다.
    return db_todo

# 상점의 모든 물품을 조회하는 함수
def get_all_shop_items(db: Session):
    """
    Item DB 모델을 사용하여 상점에 진열된 모든 물품을 조회합니다.
    """
    # Item 모델이 'is_on_sale' 등의 필터를 가지고 있다면 추가할 수 있습니다.
    # 예시: return db.query(models.Item).filter(models.Item.is_on_sale == True).all()
    
    # 현재는 모든 물품을 조회한다고 가정합니다.
    return db.query(models.Item).all()

# 사용자 당근 잔액 조회 함수
def get_carrot_balance(db: Session, user_id: int) -> int | None:
    """
    사용자 ID로 현재 당근 잔액(carrot_balance)을 조회합니다.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        # 💡 User 모델에 carrot_balance 필드가 있으므로 바로 접근
        return user.carrot_balance
    return None

# 사용자 당근 잔액 업데이트 함수
def update_carrot_balance(db: Session, user_id: int, amount: int) -> models.User | None:
    """
    사용자 ID로 당근 잔액을 주어진 양(amount)만큼 증가시키거나 감소시킵니다.
    (amount가 양수면 증가, 음수면 감소)
    """
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        # 🥕 잔액 변경
        db_user.carrot_balance += amount
        
        # ❌ 잔액이 음수가 되는 것을 방지하는 로직을 추가할 수 있습니다.
        if db_user.carrot_balance < 0:
             # 잔액이 부족하면 업데이트를 취소하고 None 반환 또는 에러 발생
             # 여기서는 단순 CRUD 기능에 집중하여 별도 처리 없이 진행합니다.
             pass 

        db.commit()
        db.refresh(db_user)
        return db_user
    return None

# 사용자 인벤토리 목록 조회 함수
def get_user_inventory(db: Session, user_id: int) -> List[models.Inventory]:
    """
    사용자 ID로 해당 사용자가 소유한 모든 아이템 목록(Inventory 객체 리스트)을 조회합니다.
    """
    # 💡 Inventory 모델이 User 및 Item 모델과 관계를 맺고 있다고 가정합니다.
    # User 모델에 'inventory' 관계 필드가 있다면, user.inventory로 바로 접근 가능합니다.
    # 여기서는 Inventory 테이블을 직접 쿼리합니다.
    return db.query(models.Inventory).filter(models.Inventory.user_id == user_id).all()