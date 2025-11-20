# 인벤토리 아이템과 관련된 API 엔드포인트를 처리

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .database import get_db
from . import crud, models, schemas
from .auth import get_current_user

router = APIRouter()

class InventoryUpdate(schemas.BaseModel):
    item_id: int
    is_equipped: bool

@router.get("/api/inventory", response_model=List[schemas.Inventory])
def read_user_inventory(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    현재 로그인된 사용자의 인벤토리 목록을 조회합니다.
    """
    inventory_items = crud.get_user_inventory(db, user_id=current_user.id)
    return inventory_items

@router.put("/api/inventory/{item_id}/equip", response_model=schemas.Inventory)
def update_inventory_item_status(
    item_id: int,
    inventory_update: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    사용자 인벤토리 아이템의 장착 상태를 업데이트합니다.
    동일한 타입의 다른 아이템이 장착되어 있다면 해제 처리합니다.
    """

    # URL 경로의 item_id와 Body의 item_id가 다르면 400 에러 발생
    if item_id != inventory_update.item_id:
        raise HTTPException(
            status_code=400, 
            detail=f"경로의 item_id({item_id})와 본문의 item_id({inventory_update.item_id})가 일치하지 않습니다."
        )

    updated_item = crud.update_user_inventory(
        db,
        user_id=current_user.id,
        item_id=inventory_update.item_id,
        is_equipped=inventory_update.is_equipped
    )
    if not updated_item:
        raise HTTPException(status_code=404, detail="인벤토리 아이템을 찾을 수 없거나 업데이트에 실패했습니다.")
    return updated_item
