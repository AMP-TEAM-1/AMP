
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import crud, models, schemas
from .database import get_db
from .auth import get_current_user

router = APIRouter()

@router.post("/todos/", response_model=schemas.Todo)
def create_todo_for_user(
    todo: schemas.TodoCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.create_user_todo(db=db, todo=todo, user_id=current_user.id)


@router.get("/todos/", response_model=list[schemas.Todo])
def read_todos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    todos = crud.get_todos(db, user_id=current_user.id, skip=skip, limit=limit)
    return todos


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
