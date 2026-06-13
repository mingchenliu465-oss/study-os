from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import TodoItem
from app.schemas import TodoCreate, TodoUpdate, TodoOut

router = APIRouter()


@router.post("/", response_model=TodoOut)
def create_todo(data: TodoCreate, db: Session = Depends(get_db)):
    max_order = db.query(TodoItem).count()
    todo = TodoItem(
        title=data.title,
        description=data.description,
        priority=data.priority,
        due_date=data.due_date,
        sort_order=max_order,
    )
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@router.get("/", response_model=List[TodoOut])
def list_todos(db: Session = Depends(get_db)):
    todos = db.query(TodoItem).order_by(TodoItem.sort_order.asc()).all()
    return todos


@router.get("/today", response_model=List[TodoOut])
def list_today_todos(db: Session = Depends(get_db)):
    from datetime import date
    todos = db.query(TodoItem).filter(TodoItem.due_date == date.today()).order_by(TodoItem.sort_order.asc()).all()
    return todos


@router.put("/{todo_id}", response_model=TodoOut)
def update_todo(todo_id: int, data: TodoUpdate, db: Session = Depends(get_db)):
    todo = db.query(TodoItem).filter(TodoItem.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(todo, field, value)
    db.commit()
    db.refresh(todo)
    return todo


@router.delete("/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(TodoItem).filter(TodoItem.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(todo)
    db.commit()
    return {"ok": True}


@router.post("/reorder")
def reorder_todos(orders: dict, db: Session = Depends(get_db)):
    for todo_id, sort_order in orders.items():
        todo = db.query(TodoItem).filter(TodoItem.id == int(todo_id)).first()
        if todo:
            todo.sort_order = sort_order
    db.commit()
    return {"ok": True}
