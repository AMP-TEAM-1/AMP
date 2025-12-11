from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session 
from datetime import date
from . import crud, models, schemas
from .database import get_db
from .auth import get_current_user

router = APIRouter()

# --- 할일(Todo) 생성 API ---
@router.post("/todos/", response_model=schemas.Todo)
def create_todo_for_user(
    todo: schemas.TodoCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user),  
):
    # crud 함수를 호출하여 데이터베이스에 할일을 생성하고, 생성된 할일 객체를 반환.
    return crud.create_user_todo(db=db, todo=todo, user_id=current_user.id)

# --- 할일(Todo) 목록 조회 API ---
@router.get("/todos/", response_model=list[schemas.Todo])
def read_todos(
    request: Request, 
    target_date: date,
    db: Session = Depends(get_db),  
    current_user: models.User = Depends(get_current_user),  
):
    # 백엔드에서 받은 요청 헤더와 인증된 사용자 정보를 출력.
    print(f"[todos.py - read_todos] 요청 헤더: {request.headers}")
    print(f"[todos.py - read_todos] 인증된 사용자: {current_user.email} (ID: {current_user.id})")
    # 날짜를 기준으로 할일을 조회하는 crud 함수 호출
    todos = crud.get_todos_by_date(db, user_id=current_user.id, target_date=target_date)
    if todos is None:
        return []
    return todos

# --- 특정 할일(Todo) 조회 API ---
@router.get("/todos/{todo_id}", response_model=schemas.Todo)
def read_todo_by_id(
    todo_id: int, 
    db: Session = Depends(get_db),  
    current_user: models.User = Depends(get_current_user),  
):
    db_todo = crud.get_todo(db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    if db_todo.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this todo")
    return db_todo

# --- 특정 할일(Todo) 수정 API ---
@router.put("/todos/{todo_id}", response_model=schemas.Todo)
def update_todo_by_id(
    todo_id: int, 
    todo: schemas.TodoUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user),  
):
    db_todo = crud.get_todo(db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    if db_todo.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this todo")
    return crud.update_todo(db=db, todo_id=todo_id, todo=todo)

# --- 특정 할일(Todo) 삭제 API ---
@router.delete("/todos/{todo_id}", response_model=schemas.Todo)
def delete_todo_by_id(
    todo_id: int,  
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user),  
):
    db_todo = crud.get_todo(db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    if db_todo.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this todo")
    return crud.delete_todo(db=db, todo_id=todo_id)

# --- 할일(Todo) 당근 지급 로직 API ---
@router.post("/todos/{todo_id}/complete/", response_model=schemas.User)
def complete_todo(
    todo_id: int, 
    db: Session = Depends(get_db),  
    current_user: models.User = Depends(get_current_user), 
):
    db_todo = crud.get_todo(db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    if db_todo.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to complete this todo")
    if db_todo.completed:
        raise HTTPException(status_code=400, detail="Todo is already completed")
    db_todo.completed = True
    current_user.carrot_balance += 1
    db.commit()
    db.refresh(current_user)
    return current_user

# --- 할일(Todo) 완료 취소 API ---
@router.post("/todos/{todo_id}/uncomplete/", response_model=schemas.User)
def uncomplete_todo(
    todo_id: int,  
    db: Session = Depends(get_db),  
    current_user: models.User = Depends(get_current_user),  
):
    db_todo = crud.get_todo(db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    if db_todo.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to uncomplete this todo")
    if not db_todo.completed:
        raise HTTPException(status_code=400, detail="Todo is not completed yet")
    db_todo.completed = False
    current_user.carrot_balance = max(0, current_user.carrot_balance - 1)
    db.commit()
    db.refresh(current_user)
    return current_user

# --- Category APIs ---
@router.get("/categories/", response_model=list[schemas.Category])
def read_categories(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_categories_by_user(db, user_id=current_user.id)

@router.post("/categories/", response_model=schemas.Category)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_category(db=db, category=category, user_id=current_user.id)

@router.put("/categories/{category_id}", response_model=schemas.Category)
def update_category(
    category_id: int,
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category and db_category.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.update_category(db=db, category_id=category_id, category=category)

@router.delete("/categories/{category_id}", response_model=schemas.Category)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category and db_category.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.delete_category(db=db, category_id=category_id)