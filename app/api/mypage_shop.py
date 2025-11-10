from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from .database import get_db
from . import crud, models, schemas
from .auth import get_current_user

router = APIRouter()

class CarrotUpdate(schemas.BaseModel):
    amount: int  # 잔액 변경량 (양수: 증가, 음수: 감소)

@router.get("/shop/items")
def read_shop_items(
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    """
    상점에 진열된 모든 물품 목록을 조회합니다.
    """
    try:
        items = crud.get_all_shop_items(db)
        result = []
        for item in items:
            result.append({
                "name": item.name,
                "price": item.price,
                "image_url": item.image_url,
                "item_id": item.id,  # id → item_id 변환
                "type": item.item_type  # item_type → type 변환
            })
        
        return result
        
    except Exception as e:
        print(f"상점 물품 조회 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="아이템 목록을 불러오는 데 실패했습니다.")
    
@router.get("/shop/balance/", response_model=int)
def read_user_carrot_balance(
    current_user: models.User = Depends(get_current_user)
):
    """
    현재 로그인된 사용자의 당근 잔액을 조회합니다.
    """
    return current_user

@router.put("/shop/balance/", response_model=schemas.User)
def update_user_carrot_balance(
    carrot_update: CarrotUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    현재 로그인된 사용자의 당근 잔액을 업데이트합니다.
    """
    if hasattr(current_user, 'carrot_balance') and isinstance(current_user.carrot_balance, int):
        return current_user.carrot_balance
    
    # 만약 User 객체가 DB 세션에서 제대로 로드되지 않아 잔액 정보가 없다면
    raise HTTPException(status_code=404, detail="사용자 잔액 정보를 찾을 수 없습니다.")
    
@router.post("/shop/purchase/", response_model=schemas.User)
def purchase_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
): 
    '''
    현재 로그인된 사용자가 아이템을 구매합니다 (잔액 차감 및 인벤토리 추가 트랜잭션)
    '''
    # 구매 트랜잭션 처리
    updated_user = crud.purchase_item_transaction(db, current_user.id, item_id)
    
    if updated_user is None:
        # Item 또는 User를 찾을 수 없음
        item = db.query(models.Item).filter(models.Item.id == item_id).first()
        if not item:
             raise HTTPException(status_code=404, detail="아이템을 찾을 수 없습니다.")
        # User가 None인 경우는 get_current_user에서 이미 처리되지만, 안전을 위해 404 처리
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.") 
        
    elif updated_user is False:
        # 잔액 부족 (crud.purchase_item_transaction에서 정의된 반환 값)
        raise HTTPException(status_code=400, detail="당근 잔액이 부족하여 아이템을 구매할 수 없습니다.")

    return updated_user