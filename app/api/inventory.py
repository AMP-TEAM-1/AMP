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
    inventory_items = crud.get_user_inventory(db, user_id=current_user.id)
    return inventory_items

@router.put("/api/inventory/{item_id}/equip", response_model=schemas.Inventory)
def update_inventory_item_status(
    item_id: int,
    inventory_update: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

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
