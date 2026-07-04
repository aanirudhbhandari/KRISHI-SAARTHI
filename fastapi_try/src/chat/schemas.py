# pyrefly: ignore [missing-import]
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message:str

class ChatResponse(BaseModel):
    reply:str
  

  
