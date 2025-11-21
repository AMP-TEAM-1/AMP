# AMP (A-AMP) 프로젝트

carrot 프로젝트 파일 구조 및 주요 기능 설명

## 실행 방법

### 가상환경 실행 (가상환경 설치한 사람 한정)
프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 Python 가상환경을 활성화합니다.
```bash
venv\Scripts\activate
```
비활성화는 `deactivate` 명령어를 사용합니다.

### Backend (FastAPI)
가상환경이 활성화된 상태에서 다음 명령어를 실행하여 백엔드 서버를 시작합니다.
```bash
uvicorn app.api.main:app --reload
```

### Frontend (React Native - Expo)
새로운 터미널에서 다음 명령어를 실행하여 프론트엔드 앱을 시작합니다.
```bash
npx expo start 
```

## 프로젝트 구조 및 파일 역할

### 📁 `app/`
애플리케이션의 핵심 소스 코드가 위치합니다. React Native (프론트엔드)와 FastAPI (백엔드) 코드가 함께 포함되어 있습니다.

#### 📁 `api/` - Backend (FastAPI)
백엔드 API 서버 관련 파일들입니다.

- **`main.py`**: FastAPI 애플리케이션의 주 진입점(entry point)입니다. API 라우터를 포함하고 서버를 실행하는 역할을 합니다.
- **`database.py`**: 데이터베이스 연결 및 세션 관리를 담당합니다.
- **`models.py`**: SQLAlchemy를 사용하여 데이터베이스 테이블 구조(ORM 모델)를 정의합니다.
- **`schemas.py`**: Pydantic을 사용하여 API 요청/응답의 데이터 유효성 검사 및 형태를 정의합니다.
- **`crud.py`**: 데이터베이스에 대한 CRUD (Create, Read, Update, Delete) 작업을 수행하는 함수들을 모아놓은 파일입니다.
- **`auth.py`**: 사용자 인증(로그인, 회원가입)과 관련된 API 엔드포인트를 정의합니다.
- **`security.py`**: 비밀번호 해싱, JWT 토큰 생성 및 검증 등 보안 관련 로직을 처리합니다.
- **`todos.py`**: '할 일' 기능 관련 API 엔드포인트를 정의합니다.
- **`inventory.py`**: '인벤토리' 기능 관련 API 엔드포인트를 정의합니다.
- **`mypage_shop.py`**: '마이페이지' 및 '상점' 기능 관련 API 엔드포인트를 정의합니다.

#### 📁 `page/`, `(tabs)/` - Frontend (React Native)
애플리케이션의 화면(페이지)을 구성하는 React Native 컴포넌트들입니다.

- **`page/`**: `login.tsx`, `mypage.tsx`, `inventory.tsx` 등 주요 페이지 컴포넌트가 위치합니다.
- **`(tabs)/`**: 하단 탭 네비게이션을 통해 접근하는 페이지들(`explore.tsx`, `index.tsx`)이 위치합니다.

#### 📁 `components/` - Frontend (React Native)
여러 페이지에서 재사용되는 공통 UI 컴포넌트들입니다.

- `AppHeader.tsx`, `ItemGrid.tsx`, `ConfirmationModal.tsx` 등이 포함됩니다.

#### 📁 `hooks/` - Frontend (React Native)
React Custom Hook을 모아놓은 디렉토리입니다. 상태 관리 로직, API 호출 등 반복되는 로직을 재사용하기 위해 사용됩니다.

- `useShop.ts`, `useInventory.ts` 등이 포함됩니다.

#### 📁 `store/` - Frontend (React Native)
Zustand와 같은 상태 관리 라이브러리를 사용하여 전역 상태를 관리합니다.

- `userStore.ts`: 사용자 정보(예: 로그인 상태)를 전역으로 관리합니다.

#### 📁 `assets/`
이미지, 폰트 등 정적 에셋 파일이 위치합니다.

### 📁 기타 주요 파일
- **`.gitignore`**: Git 버전 관리에서 제외할 파일 및 폴더를 지정합니다.
- **`package.json`**: 프로젝트 정보 및 `npm` 의존성(라이브러리) 목록을 관리합니다.
- **`requirements.txt`**: Python 의존성(라이브러리) 목록을 관리합니다.
- **`babel.config.js`**: Babel 컴파일러 설정을 담당합니다.
- **`tsconfig.json`**: TypeScript 컴파일러 설정을 담당합니다.