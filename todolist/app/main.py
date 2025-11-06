from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine

# 애플리케이션 시작 시 데이터베이스 테이블 생성
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS 미들웨어 추가
# allow_credentials=True 일 때는 보안 상의 이유로 allow_origins에 와일드카드("*")를 사용할 수 없습니다.
# 따라서 요청을 허용할 출처(origin) 목록을 명시적으로 지정해야 합니다.
origins = [
    "http://localhost",
    "http://localhost:8081",  # Expo 웹 개발 서버
    "http://127.0.0.1:8081",
    # 여기에 필요한 다른 개발/배포 환경의 주소를 추가할 수 있습니다.
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 인증 관련 라우터 등록
from .auth import router as auth_router
app.include_router(auth_router)

# Todo 관련 라우터 등록
from .todos import router as todos_router
app.include_router(todos_router)
