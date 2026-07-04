# pyrefly: ignore [missing-import]
from fastapi import HTTPException

from .schemas import ChatRequest,ChatResponse


def chat_with_ai(data:ChatRequest)->ChatResponse:
    return ChatResponse(
        reply="this is dummy reply"
    )






