from sqlalchemy.orm import Session, joinedload
from datetime import date
from typing import List
from . import models, schemas, security

# --- User CRUD 함수 ---
def get_user_by_email(db: Session, email: str) -> models.User | None:
    return db.query(models.User).filter(models.User.email == email).first()

# 사용자 계정 생성 
def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = security.get_password_hash(user.password)
    # 해시된 비밀번호 저장
    db_user = models.User(email=user.email, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Todo CRUD 함수 ---
def get_todos(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Todo).filter(models.Todo.owner_id == user_id).offset(skip).limit(limit).all()

def get_todos_by_date(db: Session, user_id: int, target_date: date):
    return db.query(models.Todo).filter(models.Todo.owner_id == user_id, models.Todo.date == target_date).all()

def create_user_todo(db: Session, todo: schemas.TodoCreate, user_id: int):
    todo_data = todo.dict(exclude={'category_ids'})
    db_todo = models.Todo(**todo_data, owner_id=user_id)

    if todo.category_ids:
        categories = db.query(models.Category).filter(models.Category.id.in_(todo.category_ids)).all()
        if categories:
            db_todo.categories.extend(categories)

    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

def get_todo(db: Session, todo_id: int):
    return db.query(models.Todo).filter(models.Todo.id == todo_id).first()

def update_todo(db: Session, todo_id: int, todo: schemas.TodoUpdate):
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not db_todo:
        return None
    # 완료 상태 변경에 따른 당근 잔액 업데이트
    if todo.completed is not None and db_todo.completed != todo.completed:
        amount = 30 if todo.completed else -30
        update_carrot_balance(db, user_id=db_todo.owner_id, amount=amount)

    if todo.category_ids is not None:
        db_todo.categories.clear()
        if todo.category_ids:
            categories = db.query(models.Category).filter(models.Category.id.in_(todo.category_ids)).all()
            db_todo.categories.extend(categories)

    update_data = todo.dict(exclude_unset=True)
    update_data.pop('category_ids', None)  
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
    return db_todo

# --- Category CRUD 함수 ---
def get_categories_by_user(db: Session, user_id: int):
    return db.query(models.Category).filter(models.Category.owner_id == user_id).all()

def create_category(db: Session, category: schemas.CategoryCreate, user_id: int):
    db_category = models.Category(**category.dict(), owner_id=user_id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, category_id: int, category: schemas.CategoryCreate):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category:
        db_category.text = category.text
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category:
        for todo in db_category.todos:
            db.delete(todo)
        db.delete(db_category)
        db.commit()
    return db_category


# 상점의 모든 물품을 조회하는 함수
def get_all_shop_items(db: Session):
    return db.query(models.Item).all()

# 사용자 당근 잔액 조회 함수
def get_carrot_balance(db: Session, user_id: int) -> int | None:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        return user.carrot_balance
    return None

# 사용자 당근 잔액 업데이트 함수
def update_carrot_balance(db: Session, user_id: int, amount: int) -> models.User | None:
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.carrot_balance += amount
        if db_user.carrot_balance < 0:
             pass 

        db.commit()
        db.refresh(db_user)
        return db_user
    return None

# 사용자 인벤토리 목록 조회 함수
def get_user_inventory(db: Session, user_id: int) -> List[models.Inventory]:
    return db.query(models.Inventory)\
        .options(joinedload(models.Inventory.item))\
        .filter(models.Inventory.user_id == user_id)\
        .all()

def update_user_inventory(db: Session, user_id: int, item_id: int, is_equipped: bool) -> models.Inventory | None:
    inventory_item = db.query(models.Inventory).filter(
        models.Inventory.user_id == user_id,
        models.Inventory.item_id == item_id
    ).first()

    if not inventory_item:
        return None

    # 장착하는 경우
    if is_equipped:
        item_to_equip = db.query(models.Item).filter(models.Item.id == item_id).first()
        if not item_to_equip:
            return None 
        
        item_type = item_to_equip.item_type

        # 동일한 타입의 다른 장착된 아이템을 해제
        currently_equipped_items = db.query(models.Inventory).join(models.Item).filter(
            models.Inventory.user_id == user_id,
            models.Inventory.is_equipped == True,
            models.Item.item_type == item_type,
            models.Inventory.item_id != item_id 
        ).all()

        for equipped_item in currently_equipped_items:
            equipped_item.is_equipped = False

        # User 모델의 equipped_id 필드 업데이트
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            if item_type == 'hat':
                user.equipped_hat_id = item_id
            elif item_type == 'accessory':
                user.equipped_acc_id = item_id
            elif item_type == 'background':
                user.equipped_background_id = item_id

    # 장착 해제하는 경우
    else:
        # User 모델의 equipped_id 필드 초기화
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            item_to_unequip = db.query(models.Item).filter(models.Item.id == item_id).first()
            if item_to_unequip:
                if item_to_unequip.item_type == 'hat' and user.equipped_hat_id == item_id:
                    user.equipped_hat_id = None
                elif item_to_unequip.item_type == 'accessory' and user.equipped_acc_id == item_id:
                    user.equipped_acc_id = None
                elif item_to_unequip.item_type == 'background' and user.equipped_background_id == item_id:
                    user.equipped_background_id = None

    # 현재 아이템의 is_equipped 상태 업데이트
    inventory_item.is_equipped = is_equipped
    
    db.commit()
    db.refresh(inventory_item)
    
    return inventory_item

# 상점 아이템 구매 로직 데이터 일관성 준수
def purchase_item_transaction(
    db: Session, 
    user_id: int, 
    item_id: int
) -> models.User | str:
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not item:
        return "item_not_found"
    if not user:
        return "user_not_found"

    # 중복 구매 확인
    existing_inventory = db.query(models.Inventory).filter(
        models.Inventory.user_id == user_id,
        models.Inventory.item_id == item_id
    ).first()

    if existing_inventory:
        return "already_owned"

    # 잔액 확인
    if user.carrot_balance < item.price:
        return "not_enough_balance"
    
    # 트랜잭션 처리
    try:
        user.carrot_balance -= item.price
        
        new_inventory_item = models.Inventory(
            user_id=user_id,
            item_id=item_id,
            is_equipped=False
        )
        db.add(new_inventory_item)
        db.commit()
        db.refresh(user)
        db.refresh(new_inventory_item)
        
        return user

    except Exception as e:
        db.rollback()
        return "transaction_failed"