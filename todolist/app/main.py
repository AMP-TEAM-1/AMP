from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from fastapi.middleware.cors import CORSMiddleware

from . import crud, models, schemas, security
from .database import get_db, engine

# 애플리케이션 시작 시 데이터베이스 테이블 생성
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS 미들웨어 추가
# 프런트엔드 개발 서버 주소 (예: Expo Go) 등을 origins에 추가해야 합니다.
# 실제 프로덕션 환경에서는 프런트엔드 서비스 도메인을 추가합니다.
origins = [
    "http://localhost",
    "http://localhost:8081", # Expo Go 기본 포트
    # 필요에 따라 다른 출처 추가
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- 의존성: 현재 인증된 사용자 정보 가져오기 ---
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# --- API 엔드포인트 ---

@app.post("/signup/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    ## 회원가입
    - **email**: 사용자 이메일
    - **password**: 사용자 비밀번호
    """
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/login/", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    ## 로그인
    - **username**: 사용자 이메일 (OAuth2 표준에 따라 username 필드 사용)
    - **password**: 사용자 비밀번호
    """
    user = crud.get_user_by_email(db, email=form_data.username)
    # DB의 'password' 필드와 입력된 비밀번호를 비교합니다.
    if not user or not security.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    """
    ## 내 정보 확인
    - 헤더에 `Authorization: Bearer <TOKEN>` 형식으로 토큰 필요
    """
    return current_user
