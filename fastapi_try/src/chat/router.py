# pyrefly: ignore [missing-import]
from fastapi import APIRouter,Depends
from typing import List
from sqlalchemy.orm import Session
from src.auth.security import get_current_user
from src.users.models import User
from src.databse.database import get_db
from .schemas import (
    ChatRequest,
    ChatResponse,
    ConversationSummary,
    ConversationDetail,
)
from . import controller

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.get("/conversations", response_model=List[ConversationSummary])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return controller.get_conversations(db, current_user)


@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return controller.get_conversation(db, conversation_id, current_user)


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return controller.delete_conversation(db, conversation_id, current_user)


@router.post("", response_model=ChatResponse)
def chat_with_ai(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return controller.chat_with_ai(db, data, current_user)
