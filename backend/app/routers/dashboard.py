from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date, timedelta
import json

from app.database import get_db
from app.models import StudySession, TodoItem, GradeRecord, DailyStudy
from app.schemas import DashboardStats, GradeOut

router = APIRouter()

GAOKAO_DATE = date(2027, 6, 7)

SUBJECTS = ["语文", "数学", "英语", "物理", "化学", "生物"]


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    today = date.today()
    gaokao_days = max(0, (GAOKAO_DATE - today).days)

    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())
    today_sessions = db.query(StudySession).filter(
        StudySession.start_time >= today_start,
        StudySession.start_time <= today_end
    ).all()
    today_minutes = sum(s.duration_minutes for s in today_sessions)

    week_start = today - timedelta(days=today.weekday())
    week_start_dt = datetime.combine(week_start, datetime.min.time())
    week_sessions = db.query(StudySession).filter(
        StudySession.start_time >= week_start_dt
    ).all()
    week_minutes = sum(s.duration_minutes for s in week_sessions)

    streak = 0
    check_day = today
    while True:
        ds = db.query(DailyStudy).filter(DailyStudy.date == check_day).first()
        if ds and ds.total_minutes > 0:
            streak += 1
            check_day -= timedelta(days=1)
        else:
            break

    todos = db.query(TodoItem).filter(TodoItem.due_date == today).all()
    completed_todos = [t for t in todos if t.completed]
    task_rate = (len(completed_todos) / len(todos) * 100) if todos else 100.0

    subject_progress = []
    for subj in SUBJECTS:
        grades = db.query(GradeRecord).filter(GradeRecord.subject == subj).order_by(GradeRecord.exam_date.desc()).limit(3).all()
        avg = sum(g.score for g in grades) / len(grades) if grades else 0
        subject_progress.append({"subject": subj, "average": round(avg, 1), "count": len(grades)})

    recent_grades = db.query(GradeRecord).order_by(GradeRecord.exam_date.desc()).limit(10).all()

    return DashboardStats(
        gaokao_days=gaokao_days,
        today_minutes=today_minutes,
        week_minutes=week_minutes,
        streak_days=streak,
        task_completion_rate=round(task_rate, 1),
        subject_progress=subject_progress,
        recent_grades=[GradeOut.model_validate(g) for g in recent_grades],
    )


@router.post("/quick-log")
def quick_log(subject: str, minutes: int, db: Session = Depends(get_db)):
    if minutes <= 0:
        raise HTTPException(status_code=400, detail="Minutes must be positive")
    now = datetime.now()
    start = now - timedelta(minutes=minutes)
    session = StudySession(subject=subject, start_time=start, end_time=now, duration_minutes=minutes)
    db.add(session)

    today = date.today()
    ds = db.query(DailyStudy).filter(DailyStudy.date == today).first()
    if not ds:
        ds = DailyStudy(date=today, total_minutes=0, subjects="{}")
        db.add(ds)
    ds.total_minutes += minutes
    subs = json.loads(ds.subjects)
    subs[subject] = subs.get(subject, 0) + minutes
    ds.subjects = json.dumps(subs)

    db.commit()
    return {"ok": True, "today_minutes": ds.total_minutes}
