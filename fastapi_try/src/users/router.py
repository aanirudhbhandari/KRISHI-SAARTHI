# pyrefly: ignore [missing-import]
from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from .schemas import UserCreate,UserResponse,UserUpdate
from typing import List
from src.databse.database import get_db
from . import controller



router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/",response_model=List[UserResponse])
def get_users(db:Session=Depends(get_db)):
    return controller.get_users(db)


@router.get("/{id}",response_model=UserResponse)
def get_user_by_id(id:int,db:Session=Depends(get_db)):
    return controller.get_user_by_id(db,id)



@router.post("/",response_model=UserResponse)
def create_user(
    user:UserCreate,
    db:Session=Depends(get_db)
):
    return controller.create_user(db,user)


@router.put("/{id}",response_model=UserResponse)
def update_user(
    id:int,
    user:UserUpdate,
    db:Session=Depends(get_db)
):
    return controller.update_user(db,id,user)


@router.delete("/{id}")
def delete_user(id:int,db:Session=Depends(get_db)):
    return controller.delete_user(db,id)
