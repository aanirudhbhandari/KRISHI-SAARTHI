# pyrefly: ignore [missing-import]
from fastapi import HTTPException
from src.ai.gemini import generate_response

from .schemas import ChatRequest,ChatResponse


def chat_with_ai(data:ChatRequest)->ChatResponse:
    response = generate_response(data.message)
    return ChatResponse(
        reply=response
    )
   






