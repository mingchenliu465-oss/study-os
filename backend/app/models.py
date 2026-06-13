from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Date
from sqlalchemy.sql import func
from app.database import Base


class StudySession(Base):
    __tablename__ = "study_sessions"
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, index=True)
    start_time = Column(DateTime, default=func.now())
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())


class TodoItem(Base):
    __tablename__ = "todo_items"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String, default="medium")
    completed = Column(Boolean, default=False)
    due_date = Column(Date, nullable=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())


class GradeRecord(Base):
    __tablename__ = "grade_records"
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False, index=True)
    exam_type = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    max_score = Column(Float, default=100.0)
    exam_date = Column(Date, nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())


class DailyStudy(Base):
    __tablename__ = "daily_study"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, index=True)
    total_minutes = Column(Integer, default=0)
    subjects = Column(Text, default="{}")


class Mistake(Base):
    __tablename__ = "mistakes"
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(String, default="")
    difficulty = Column(Integer, default=1)
    reason = Column(Text, nullable=True)
    knowledge_point = Column(String, nullable=True)
    is_favorite = Column(Boolean, default=False)
    image_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
