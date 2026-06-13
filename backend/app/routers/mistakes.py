from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Mistake

router = APIRouter()


@router.post("/")
def create_mistake(
    subject: str,
    title: str,
    content: str,
    tags: str = "",
    difficulty: int = 1,
    reason: str = "",
    knowledge_point: str = "",
    db: Session = Depends(get_db)
):
    m = Mistake(
        subject=subject,
        title=title,
        content=content,
        tags=tags,
        difficulty=difficulty,
        reason=reason,
        knowledge_point=knowledge_point,
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.get("/")
def list_mistakes(subject: str = None, search: str = None, db: Session = Depends(get_db)):
    q = db.query(Mistake).order_by(Mistake.created_at.desc())
    if subject:
        q = q.filter(Mistake.subject == subject)
    if search:
        q = q.filter(Mistake.title.contains(search) | Mistake.content.contains(search))
    return q.all()


@router.put("/{mistake_id}")
def update_mistake(mistake_id: int, data: dict, db: Session = Depends(get_db)):
    m = db.query(Mistake).filter(Mistake.id == mistake_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.items():
        if hasattr(m, k):
            setattr(m, k, v)
    db.commit()
    db.refresh(m)
    return m


@router.delete("/{mistake_id}")
def delete_mistake(mistake_id: int, db: Session = Depends(get_db)):
    m = db.query(Mistake).filter(Mistake.id == mistake_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(m)
    db.commit()
    return {"ok": True}


@router.post("/{mistake_id}/upload")
def upload_image(mistake_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    m = db.query(Mistake).filter(Mistake.id == mistake_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Not found")
    import os
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"{mistake_id}_{file.filename}"
    path = os.path.join(upload_dir, filename)
    with open(path, "wb") as f:
        f.write(file.file.read())
    m.image_path = path
    db.commit()
    return {"ok": True, "path": path}


@router.get("/stats/by-knowledge")
def stats_by_knowledge(db: Session = Depends(get_db)):
    from sqlalchemy import func
    rows = db.query(Mistake.knowledge_point, func.count(Mistake.id)).group_by(Mistake.knowledge_point).all()
    return [{"knowledge_point": r[0] or "未分类", "count": r[1]} for r in rows]
