# pyrefly: ignore [missing-import]
from fastapi import HTTPException
from sqlalchemy.orm import Session
from .models import User
from .schemas import UserCreate,UserUpdate
from src.auth.security import hash_password


def get_users(db:Session):
    return db.query(User).all()


def get_user_by_id(db:Session,id:int):
    user=db.query(User).filter(User.id==id).first()
    
    if user is None:
        raise HTTPException(status_code=404,detail="User Not Found")
    return user



def create_user(db:Session,user:UserCreate):
    new_user=User(name=user.name,email=user.email,password=hash_password(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user 


def update_user(db:Session,id:int,user_data:UserUpdate):
    user=db.query(User).filter(User.id==id).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    user.name=user_data.name
    user.email=user_data.email
    
    db.commit()
    db.refresh(user)

    return user



def delete_user(db:Session,id:int):

    user=db.query(User).filter(User.id==id).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"

        )

    db.delete(user)
    db.commit()

    return{
        "message":"User Deleted Successfully"
    }
    





