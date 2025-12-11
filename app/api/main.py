from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://10.0.2.2:8080",
    "http://localhost",
    "http://localhost:8081", 
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 인증 
from .auth import router as auth_router
app.include_router(auth_router)

# Todo 
from .todos import router as todos_router
app.include_router(todos_router)

# MyPage 
from .mypage_shop import router as mypage_router
app.include_router(mypage_router)

# inventory 
from .inventory import router as inventory_router
app.include_router(inventory_router)
