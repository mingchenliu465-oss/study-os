from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta

from app.database import get_db
from app.models import DailyStudy
from app.schemas import DailyStudyOut

router = APIRouter()


@router.get("/", response_model=List[DailyStudyOut])
def get_heatmap(year: int = None, db: Session = Depends(get_db)):
    if year is None:
        year = date.today().year
    start = date(year, 1, 1)
    end = date(year, 12, 31)
    records = db.query(DailyStudy).filter(
        DailyStudy.date >= start,
        DailyStudy.date <= end
    ).order_by(DailyStudy.date.asc()).all()
    return records


@router.get("/current-year")
def get_current_year_heatmap(db: Session = Depends(get_db)):
    year = date.today().year
    start = date(year, 1, 1)
    end = date(year, 12, 31)
    records = db.query(DailyStudy).filter(
        DailyStudy.date >= start,
        DailyStudy.date <= end
    ).order_by(DailyStudy.date.asc()).all()
    return [
        {"date": r.date.isoformat(), "total_minutes": r.total_minutes}
        for r in records
    ]


@router.get("/streak")
def get_streak(db: Session = Depends(get_db)):
    today = date.today()
    streak = 0
    check_day = today
    while True:
        ds = db.query(DailyStudy).filter(DailyStudy.date == check_day).first()
        if ds and ds.total_minutes > 0:
            streak += 1
            check_day -= timedelta(days=1)
        else:
            break
    return {"streak": streak}
