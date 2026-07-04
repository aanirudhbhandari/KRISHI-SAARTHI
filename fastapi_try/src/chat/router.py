# pyrefly: ignore [missing-import]
from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from .schemas import ChatRequest,ChatResponse
from typing import List
from src.databse.database import get_db
from . import controller



router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.post("/",response_model=ChatResponse)
def chat_with_ai(
    data:ChatRequest
):
    return controller.chat_with_ai(data)






