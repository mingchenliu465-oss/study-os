from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


class StudySessionCreate(BaseModel):
    subject: str


class StudySessionOut(BaseModel):
    id: int
    subject: str
    start_time: datetime
    end_time: Optional[datetime]
    duration_minutes: int

    class Config:
        from_attributes = True


class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[date] = None


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[date] = None
    sort_order: Optional[int] = None


class TodoOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    priority: str
    completed: bool
    due_date: Optional[date]
    sort_order: int
    created_at: datetime

    class Config:
        from_attributes = True


class GradeCreate(BaseModel):
    subject: str
    exam_type: str
    score: float
    max_score: float = 100.0
    exam_date: date
    note: Optional[str] = None


class GradeOut(BaseModel):
    id: int
    subject: str
    exam_type: str
    score: float
    max_score: float
    exam_date: date
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DailyStudyOut(BaseModel):
    date: date
    total_minutes: int
    subjects: str

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    gaokao_days: int
    today_minutes: int
    week_minutes: int
    streak_days: int
    task_completion_rate: float
    subject_progress: List[dict]
    recent_grades: List[GradeOut]
