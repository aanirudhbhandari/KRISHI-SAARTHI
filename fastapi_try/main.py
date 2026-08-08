# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException, status

from src.databse.base import Base
from src.databse.database import engine
from src.users.router import router as user_router
from src.chat.router import router as chat_router
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from src.auth.router import router as auth_router



import os

app = FastAPI(title="Krishi Saarthi API")

raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



from src.users.models import User
from src.chat.models import Conversation, ChatMessage

Base.metadata.create_all(bind=engine)


app.include_router(auth_router)
app.include_router(user_router)
app.include_router(chat_router)
    
@app.get("/")
def home():
    return {"message":"hello , welcome to krishi-Saarthi"}   







