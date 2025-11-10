from sqlalchemy.orm import Session
from datetime import date
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

# 🥕 사용자 ID와 날짜로 Todo 목록 조회 함수
def get_todos_by_date(db: Session, user_id: int, target_date: date):
    return db.query(models.Todo).filter(models.Todo.owner_id == user_id, models.Todo.date == target_date).all()

# 사용자 ID로 Todo 생성 함수
def create_user_todo(db: Session, todo: schemas.TodoCreate, user_id: int):
    # 🥕 category_ids를 제외한 나머지 데이터로 Todo 객체 우선 생성
    todo_data = todo.dict(exclude={'category_ids'})
    db_todo = models.Todo(**todo_data, owner_id=user_id)

    # 🥕 category_ids가 있으면 카테고리 연결
    if todo.category_ids:
        categories = db.query(models.Category).filter(models.Category.id.in_(todo.category_ids)).all()
        if categories:
            db_todo.categories.extend(categories)

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

    # 🥕 카테고리 연결 업데이트
    if todo.category_ids is not None:
        # 기존 카테고리 연결을 모두 지우고 새로 설정
        db_todo.categories.clear()
        categories = db.query(models.Category).filter(models.Category.id.in_(todo.category_ids)).all()
        db_todo.categories.extend(categories)

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
        # 🥕 이 카테고리에 연결된 모든 할 일을 삭제합니다.
        # db_category.todos는 relationship을 통해 연결된 Todo 객체 목록입니다.
        for todo in db_category.todos:
            db.delete(todo)
        # 카테고리 자체를 삭제합니다.
        db.delete(db_category)
        db.commit()
    return db_category

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

def update_user_inventory(db: Session, user_id: int, item_id: int, is_equipped: bool) -> models.Inventory | None:
    """
    사용자의 인벤토리 아이템 장착 상태를 업데이트합니다.
    """
    # 1. 업데이트할 인벤토리 아이템 조회
    inventory_item = db.query(models.Inventory).filter(
        models.Inventory.user_id == user_id,
        models.Inventory.item_id == item_id
    ).first()

    if not inventory_item:
        return None

    # 2. 장착(equip)하는 경우
    if is_equipped:
        # 2-1. 현재 아이템의 타입(hat, accessory) 조회
        item_to_equip = db.query(models.Item).filter(models.Item.id == item_id).first()
        if not item_to_equip:
            return None # 아이템 정보가 없으면 중단
        
        item_type = item_to_equip.item_type

        # 2-2. 동일한 타입의 다른 장착된 아이템을 해제(unequip) 처리
        currently_equipped_items = db.query(models.Inventory).join(models.Item).filter(
            models.Inventory.user_id == user_id,
            models.Inventory.is_equipped == True,
            models.Item.item_type == item_type,
            models.Inventory.item_id != item_id # 현재 장착하려는 아이템 제외
        ).all()

        for equipped_item in currently_equipped_items:
            equipped_item.is_equipped = False

        # 2-3. User 모델의 equipped_..._id 필드 업데이트
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            if item_type == 'hat':
                user.equipped_hat_id = item_id
            elif item_type == 'accessory':
                user.equipped_acc_id = item_id

    # 3. 장착 해제(unequip)하는 경우
    else:
        # 3-1. User 모델의 equipped_..._id 필드 초기화
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            item_to_unequip = db.query(models.Item).filter(models.Item.id == item_id).first()
            if item_to_unequip:
                if item_to_unequip.item_type == 'hat' and user.equipped_hat_id == item_id:
                    user.equipped_hat_id = None
                elif item_to_unequip.item_type == 'accessory' and user.equipped_acc_id == item_id:
                    user.equipped_acc_id = None

    # 4. 현재 아이템의 is_equipped 상태 업데이트
    inventory_item.is_equipped = is_equipped
    
    db.commit()
    db.refresh(inventory_item)
    
    return inventory_item

# 상점 아이템 구매 로직 데이터 일관성 준수
def purchase_item_transaction(
    db: Session, 
    user_id: int, 
    item_id: int
) -> models.User | None:
    """
    사용자의 잔액을 차감하고 인벤토리에 아이템을 추가하는 트랜잭션 로직
    """
    # 1. 아이템 정보 조회 (가격 확인)
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        return None  # 아이템을 찾을 수 없음 (라우터에서 404 처리)

    item_price = item.price
    
    # 2. 사용자 정보 조회 (잔액 확인)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None  # 사용자를 찾을 수 없음 (라우터에서 404 처리)

    # 3. 잔액 확인 및 차감
    if user.carrot_balance < item_price:
        # 잔액 부족 시 트랜잭션 중단 및 실패 반환 (라우터에서 400 처리)
        return False  # 잔액 부족을 나타내는 별도의 값 반환 (예: False)
    
    # 3-1. 잔액 차감 (업데이트)
    user.carrot_balance -= item_price
    
    # 4. 인벤토리 추가
    # 중복 구매 방지 로직은 Inventory 모델 설계에 따라 달라집니다.
    # 여기서는 새로운 Inventory 객체를 생성한다고 가정합니다.
    db_inventory = models.Inventory(
        user_id=user_id, 
        item_id=item_id, 
        is_equipped=False
    )
    db.add(db_inventory)
    
    # 5. DB 트랜잭션 커밋
    try:
        db.commit()
    except Exception as e:
        # 오류 발생 시 롤백하여 데이터 무결성 보장
        db.rollback()
        raise e
        
    db.refresh(user)
    return user