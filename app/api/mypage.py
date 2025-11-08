from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import Base
from . import crud, schemas

router = APIRouter()

@router.get(
    "/v1/shop/items", 
    response_model=list[schemas.Item], # schemas.Item 목록 형태로 반환
    tags=["shop"]
)

def read_shop_items(db: Session = Depends(Base)):
    """
    상점에 진열된 모든 물품 목록을 조회합니다.
    """
    try:
        # 2. 로직: 구현한 CRUD 함수를 호출하여 물품 목록을 조회
        items = crud.get_all_shop_items(db)
        
        # 3. schemas.Item 목록 형태로 반환 (FastAPI는 Pydantic 모델로 자동 직렬화)
        return items
    except Exception as e:
        print(f"상점 물품 조회 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="아이템 목록을 불러오는 데 실패했습니다.")
    
def read_carrot_balance(
    user_id: int,
    db: Session = Depends(Base)
) -> int:
    """
    특정 사용자의 당근 잔액을 조회합니다.
    """
    balance = crud.get_carrot_balance(db, user_id)
    if balance is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    return balance

def update_carrot_balance(
    user_id: int,
    amount: int,
    db: Session = Depends(Base)
) -> schemas.User:
    """
    특정 사용자의 당근 잔액을 업데이트합니다.
    amount가 양수면 잔액 증가, 음수면 잔액 감소.
    """
    user = crud.update_carrot_balance(db, user_id, amount)
    if user is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    return user

def read_user_inventory(
    user_id: int,
    db: Session = Depends(Base)
) -> list[schemas.Inventory]:
    """
    특정 사용자의 인벤토리 목록을 조회합니다.
    """
    inventory = crud.get_user_inventory(db, user_id)
    return inventory

def update_user_inventory(
    user_id: int,
    item_id: int,
    is_equipped: bool,
    db: Session = Depends(Base)
) -> schemas.Inventory:
    """
    특정 사용자의 인벤토리 아이템 장착 상태를 업데이트합니다.
    """
    inventory_item = crud.update_user_inventory(db, user_id, item_id, is_equipped)
    if inventory_item is None:
        raise HTTPException(status_code=404, detail="인벤토리 아이템을 찾을 수 없습니다.")
    return inventory_item   