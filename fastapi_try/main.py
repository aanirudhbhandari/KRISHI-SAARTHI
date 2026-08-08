import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException, status

from src.databse.base import Base
from src.databse.database import engine
from src.users.router import router as user_router
from src.chat.router import router as chat_router
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from src.auth.router import router as auth_router



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



import time
from collections import defaultdict
from sqlalchemy import text
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from fastapi import Depends, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from src.databse.database import get_db

# Rate limiter tracking for sensitive authentication routes
AUTH_ATTEMPTS = defaultdict(list)
RATE_LIMIT_MAX_ATTEMPTS = int(os.getenv("AUTH_RATE_LIMIT_MAX", "10"))
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("AUTH_RATE_LIMIT_WINDOW", "60"))

class AuthRateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path in ["/auth/login", "/auth/register"] and request.method == "POST":
            client_ip = request.client.host if request.client else "unknown"
            now = time.time()
            # Retain timestamps within the active sliding window
            AUTH_ATTEMPTS[client_ip] = [ts for ts in AUTH_ATTEMPTS[client_ip] if now - ts < RATE_LIMIT_WINDOW_SECONDS]
            if len(AUTH_ATTEMPTS[client_ip]) >= RATE_LIMIT_MAX_ATTEMPTS:
                return Response(
                    content='{"detail": "Too many requests. Please wait a minute before trying again."}',
                    status_code=429,
                    media_type="application/json",
                )
            AUTH_ATTEMPTS[client_ip].append(now)
        return await call_next(request)

app.add_middleware(AuthRateLimitMiddleware)

from src.users.models import User
from src.chat.models import Conversation, ChatMessage

Base.metadata.create_all(bind=engine)


app.include_router(auth_router)
app.include_router(user_router)
app.include_router(chat_router)
    
@app.get("/")
def home():
    return {"message": "hello , welcome to krishi-Saarthi"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection error: {str(e)}"
        )   







