from fastapi import APIRouter
from typing import Optional

router = APIRouter()


@router.post("/explain")
def explain_question(question: str, provider: str = "openai"):
    return {"message": f"[{provider}] 题目讲解功能预留接口", "question": question}


@router.post("/summarize")
def summarize_knowledge(content: str, provider: str = "openai"):
    return {"message": f"[{provider}] 知识点总结功能预留接口", "content": content}


@router.post("/generate-questions")
def generate_questions(subject: str, difficulty: str = "medium", count: int = 5, provider: str = "openai"):
    return {
        "message": f"[{provider}] 出题功能预留接口",
        "subject": subject,
        "difficulty": difficulty,
        "count": count,
    }


@router.post("/analyze-mistake")
def analyze_mistake(mistake_content: str, provider: str = "openai"):
    return {"message": f"[{provider}] 错题分析功能预留接口", "mistake_content": mistake_content}


@router.post("/study-advice")
def study_advice(recent_subjects: Optional[str] = None, provider: str = "openai"):
    return {"message": f"[{provider}] 学习建议功能预留接口", "recent_subjects": recent_subjects}
