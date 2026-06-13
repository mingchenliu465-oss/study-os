from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import GradeRecord
from app.schemas import GradeCreate, GradeOut

router = APIRouter()


@router.post("/", response_model=GradeOut)
def create_grade(data: GradeCreate, db: Session = Depends(get_db)):
    grade = GradeRecord(**data.model_dump())
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade


@router.get("/", response_model=List[GradeOut])
def list_grades(subject: str = None, db: Session = Depends(get_db)):
    q = db.query(GradeRecord).order_by(GradeRecord.exam_date.desc())
    if subject:
        q = q.filter(GradeRecord.subject == subject)
    return q.all()


@router.delete("/{grade_id}")
def delete_grade(grade_id: int, db: Session = Depends(get_db)):
    grade = db.query(GradeRecord).filter(GradeRecord.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    db.delete(grade)
    db.commit()
    return {"ok": True}


@router.get("/stats/trends")
def get_grade_trends(db: Session = Depends(get_db)):
    from sqlalchemy import func
    subjects = ["语文", "数学", "英语", "物理", "化学", "生物"]
    result = {}
    for subj in subjects:
        grades = db.query(GradeRecord).filter(GradeRecord.subject == subj).order_by(GradeRecord.exam_date.asc()).all()
        result[subj] = [
            {"date": g.exam_date.isoformat(), "score": g.score, "exam_type": g.exam_type}
            for g in grades
        ]
    return result


@router.get("/stats/analysis")
def get_grade_analysis(db: Session = Depends(get_db)):
    from sqlalchemy import func
    subjects = ["语文", "数学", "英语", "物理", "化学", "生物"]
    analysis = []
    for subj in subjects:
        grades = db.query(GradeRecord).filter(GradeRecord.subject == subj).order_by(GradeRecord.exam_date.desc()).limit(5).all()
        if not grades:
            continue
        avg = sum(g.score for g in grades) / len(grades)
        trend = grades[0].score - grades[-1].score if len(grades) > 1 else 0
        analysis.append({
            "subject": subj,
            "average": round(avg, 1),
            "latest": grades[0].score,
            "trend": round(trend, 1),
            "suggestion": "保持稳定" if trend >= 0 else "需要加强复习",
        })
    analysis.sort(key=lambda x: x["average"], reverse=True)
    return {
        "strongest": analysis[0] if analysis else None,
        "weakest": analysis[-1] if analysis else None,
        "details": analysis,
    }
