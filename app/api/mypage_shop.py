from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .auth import get_current_user
from .database import get_db

router = APIRouter()

class CarrotUpdate(schemas.BaseModel):
    amount: int  

@router.get("/shop/items")
def read_shop_items(
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
   
    try:
        items = crud.get_all_shop_items(db)
        result = []
        for item in items:
            result.append({
                "name": item.name,
                "price": item.price,
                "image_url": item.image_url,
                "item_id": item.id, 
                "type": item.item_type 
            })
        
        return result
        
    except Exception as e:
        print(f"상점 물품 조회 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="아이템 목록을 불러오는 데 실패했습니다.")
    
@router.get("/shop/balance/", response_model=int)
def read_user_carrot_balance(
    current_user: models.User = Depends(get_current_user)
):
    return current_user

@router.put("/shop/balance/", response_model=schemas.User)
def update_user_carrot_balance(
    carrot_update: CarrotUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if hasattr(current_user, 'carrot_balance') and isinstance(current_user.carrot_balance, int):
        return current_user.carrot_balance
    raise HTTPException(status_code=404, detail="사용자 잔액 정보를 찾을 수 없습니다.")
    
@router.post("/shop/purchase/", response_model=schemas.User)
def purchase_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
): 
    
    # 구매 트랜잭션 처리
    updated_user = crud.purchase_item_transaction(db, current_user.id, item_id)
    
    # 문자열 에러 코드 처리
    if isinstance(result, str):
        if result == "item_not_found":
            raise HTTPException(status_code=404, detail="아이템을 찾을 수 없습니다.")
        elif result == "user_not_found":
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        elif result == "already_owned":
            raise HTTPException(status_code=400, detail="이미 보유하고 있는 아이템입니다.")
        elif result == "not_enough_balance":
            raise HTTPException(status_code=400, detail="당근 잔액이 부족합니다.")
        else:
            raise HTTPException(status_code=500, detail="구매 처리 중 오류가 발생했습니다.")
            
    # 성공 시 (User 객체 반환)
    return result