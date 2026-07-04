# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException, status

from src.databse.base import Base
from src.databse.database import engine
from dtos import ProductDto
from mock import products
from src.users.router import router as user_router
from src.chat.router import router as chat_router
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Product Management API")

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



Base.metadata.create_all(bind=engine)


app.include_router(user_router)
app.include_router(chat_router)
    
@app.get("/")
def home():
    return {"message":"hello , welcome to krishi-Saarthi"}   

@app.get("/products/{product_id}")

def get_product(product_id:int):
    for oneProduct in products:
        if oneProduct.get("id")==product_id:            
            return oneProduct
    
    raise HTTPException(
        status_code=404,
        detail="product not found"
    )




