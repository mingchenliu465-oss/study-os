from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import json
import csv
import io
from fastapi.responses import StreamingResponse

from app.database import get_db, engine
from app.models import StudySession, TodoItem, GradeRecord, DailyStudy, Mistake

router = APIRouter()


@router.get("/json")
def export_json(db: Session = Depends(get_db)):
    data = {
        "study_sessions": [s.__dict__ for s in db.query(StudySession).all()],
        "todos": [t.__dict__ for t in db.query(TodoItem).all()],
        "grades": [g.__dict__ for g in db.query(GradeRecord).all()],
        "daily_study": [d.__dict__ for d in db.query(DailyStudy).all()],
        "mistakes": [m.__dict__ for m in db.query(Mistake).all()],
    }
    for key in data:
        for item in data[key]:
            item.pop("_sa_instance_state", None)
    return data


@router.get("/csv/grades")
def export_csv_grades(db: Session = Depends(get_db)):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "subject", "exam_type", "score", "max_score", "exam_date", "note"])
    for g in db.query(GradeRecord).all():
        writer.writerow([g.id, g.subject, g.exam_type, g.score, g.max_score, g.exam_date, g.note])
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=grades.csv"})


@router.post("/restore")
def restore_data(data: dict, db: Session = Depends(get_db)):
    return {"message": "数据恢复功能预留接口"}
