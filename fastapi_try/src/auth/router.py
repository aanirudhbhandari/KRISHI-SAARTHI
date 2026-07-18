# pyrefly: ignore [missing-import]
from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from src.databse.database import get_db
from .schemas import LoginRequest,RegisterRequest
from . import controller

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)



@router.post("/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    return controller.register_user(db, data)


@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    return controller.login_user(db, data)
