from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db
from app.routers import (
    dashboard,
    todos,
    grades,
    heatmap,
    mistakes,
    ai,
    data_export,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="StudyOS API",
    description="AI 高中学习系统后端 API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(todos.router, prefix="/api/todos", tags=["每日计划"])
app.include_router(grades.router, prefix="/api/grades", tags=["成绩分析"])
app.include_router(heatmap.router, prefix="/api/heatmap", tags=["学习热力图"])
app.include_router(mistakes.router, prefix="/api/mistakes", tags=["错题库"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI 学习助手"])
app.include_router(data_export.router, prefix="/api/export", tags=["数据导出"])


@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}
