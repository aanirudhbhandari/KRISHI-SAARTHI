# pyrefly: ignore [missing-import]
from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel


class ChatMessageSchema(BaseModel):
    id: str
    role: str
    type: str
    text: Optional[str] = None
    textHindi: Optional[str] = None
    imageFile: Optional[str] = None
    recommendation: Optional[Any] = None
    timestamp: str

    class Config:
        from_attributes = True


class ConversationSummary(BaseModel):
    id: int
    title: str
    updated_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationDetail(BaseModel):
    id: int
    title: str
    messages: List[ChatMessageSchema]

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    image_file: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    conversation_id: int
    title: str
    messages: List[ChatMessageSchema]
