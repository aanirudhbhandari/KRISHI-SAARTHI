# pyrefly: ignore [missing-import]
from fastapi import HTTPException
from src.ai.gemini import generate_response
from src.users.models import User
from .schemas import ChatRequest,ChatResponse
from .prompt import SYSTEM_PROMPT


def chat_with_ai(data:ChatRequest,current_user: User)->ChatResponse:
    response = generate_response(
        SYSTEM_PROMPT,
        data.message
        )
    return ChatResponse(
        reply=response
    )




