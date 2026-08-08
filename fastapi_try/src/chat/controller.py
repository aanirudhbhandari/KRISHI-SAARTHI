# pyrefly: ignore [missing-import]
from fastapi import HTTPException
import logging
import json
from datetime import datetime
from typing import List

logger = logging.getLogger(__name__)
from sqlalchemy.orm import Session
from src.ai.gemini import generate_response
from src.users.models import User
from src.chat.models import Conversation, ChatMessage
from .schemas import (
    ChatRequest,
    ChatResponse,
    ConversationSummary,
    ConversationDetail,
    ChatMessageSchema,
)
from .prompt import SYSTEM_PROMPT


def format_message(m: ChatMessage) -> ChatMessageSchema:
    ts = m.created_at.strftime("%I:%M %p") if m.created_at else datetime.utcnow().strftime("%I:%M %p")
    rec = None
    if m.recommendation_json:
        try:
            rec = json.loads(m.recommendation_json)
        except Exception:
            rec = None
    return ChatMessageSchema(
        id=str(m.id),
        role=m.role,
        type=m.message_type or "text",
        text=m.text,
        textHindi=m.text_hindi,
        imageFile=m.image_file,
        recommendation=rec,
        timestamp=ts,
    )


def generate_title(first_message: str) -> str:
    cleaned = first_message.strip()
    if not cleaned:
        return "New Consultation"
    if len(cleaned) <= 35:
        return cleaned
    return cleaned[:32].rstrip() + "..."


def get_conversations(db: Session, current_user: User) -> List[ConversationSummary]:
    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    return conversations


def get_conversation(db: Session, conversation_id: int, current_user: User) -> ConversationDetail:
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = [format_message(m) for m in conv.messages]
    return ConversationDetail(
        id=conv.id,
        title=conv.title,
        messages=messages
    )


def delete_conversation(db: Session, conversation_id: int, current_user: User):
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted successfully"}


def chat_with_ai(db: Session, data: ChatRequest, current_user: User) -> ChatResponse:
    if data.conversation_id:
        conv = (
            db.query(Conversation)
            .filter(Conversation.id == data.conversation_id, Conversation.user_id == current_user.id)
            .first()
        )
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        title = generate_title(data.message)
        conv = Conversation(
            user_id=current_user.id,
            title=title,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    history_messages = list(conv.messages)

    msg_type = "image" if data.image_file else "text"
    user_msg = ChatMessage(
        conversation_id=conv.id,
        role="user",
        message_type=msg_type,
        text=data.message,
        image_file=data.image_file,
        created_at=datetime.utcnow(),
    )
    db.add(user_msg)
    db.commit()

    try:
        response_text = generate_response(SYSTEM_PROMPT, data.message, history=history_messages)
    except Exception as e:
        logger.exception("Gemini API Error occurred during conversation: %s", e)
        response_text = "I am having trouble connecting to the AI field assistant model right now. Please try again."

    ai_msg = ChatMessage(
        conversation_id=conv.id,
        role="ai",
        message_type="text",
        text=response_text,
        created_at=datetime.utcnow(),
    )
    db.add(ai_msg)
    conv.updated_at = datetime.utcnow()
    db.commit()

    db.refresh(conv)
    all_messages = [format_message(m) for m in conv.messages]

    return ChatResponse(
        reply=response_text,
        conversation_id=conv.id,
        title=conv.title,
        messages=all_messages,
    )
