# 🥕 Carrot

할 일 관리에 **게이미피케이션**을 결합한 모바일 앱(React Native + FastAPI)입니다.

날짜별 Todo 관리, 카테고리 기반 필터, 보상 재화(당근), 상점·인벤토리·캐릭터 커스터마이징 기능을 제공하여 사용자의 지속적인 활동을 유도합니다.

---

## 📚 목차

- 프로젝트 소개
- 팀--담당
- 사용 기술 스택
- 실행 환경 및 방법
- 주요 기능
- 서비스 구성--페이지-설명
- 데이터 구조--핵심-api
- 워크플로우 예시: 할 일 완료 → 보상 지급

---

## 🎯 프로젝트 소개

- **Carrot**은 **생산성(Todo 관리)** + **게임적 보상 시스템(재화·아이템·커스터마이징)** 을 결합한 모바일 애플리케이션입니다.

- 사용자는 날짜별 Todo를 기록·관리하며, 할 일을 완료할 때마다 **‘당근(Carrot)’** 보상을 획득해 상점에서 아이템을 구매하고 캐릭터(토끼)를 꾸밀 수 있습니다.

### 🔑 핵심 가치

- **즉시성** — 날짜 기반 서버 조회 + 클라이언트 필터링으로 빠른 UX
- **동기부여** — 보상 재화와 커스터마이징을 통한 몰입도 향상
- **확장성** — FastAPI + React Native 기반으로 기능/플랫폼 확장 용이

---

## 👥 팀

**Solo / 개인 프로젝트**

| 역할 | 기술 | 이름  |
| --- | --- | --- |
| 프론트엔드 | React Native (Expo), TypeScript | 박진수 |
|  |  | 배지윤 |
| 백엔드, 인프라 | FastAPI, Database | 고범창 |
|  |  | 나윤서 |


---

## 🛠 사용 기술 스택

### **Frontend**

- React Native (Expo)
- TypeScript
- Zustand (전역 상태 관리)
- Axios (HTTP 통신)

### **Backend**

- FastAPI
- Uvicorn
- SQLAlchemy (ORM)
- Pydantic (Validation)
- JWT Authentication

### **Database / Infra**

- Supabase

---

## ⚙️ 실행 환경 및 방법

### 🔧 요구사항

- Node.js (v18 LTS 권장)
- npm 또는 yarn
- Python 3.10+

---

### 1) 백엔드 실행 (FastAPI)

```bash
# 가상환경 생성
python -m venv .venv

# 가상환경 활성화
source .venv/bin/activate     # mac / linux
.\.venv\Scripts\activate      # windows

# 패키지 설치
pip install -r requirements.txt

# 환경변수(.env) 설정

# 서버 실행
uvicorn app.main:app --reload
```

---

### 2) 프론트엔드 실행 (React Native / Expo)

```bash
# 의존성 설치
npm instal
# 개발 서버 실행
npm start
# 또는
expo start
```

> JWT 토큰은 AsyncStorage에 저장되며, Axios 인스턴스가 자동으로 Authorization 헤더를 포함합니다.
> 

---

## 📲 주요 기능

### ✔ Todo 관리

- 날짜별 Todo 생성/수정/삭제
- 완료 체크 시 보상 지급
- 완료 취소 시 보상 회수
- 카테고리(태그) 연동
- 무한 캘린더 스크롤

### ✔ 카테고리 시스템

- 색상 태그
- 클라이언트 즉시 필터링

### ✔ 게이미피케이션

- **당근(Carrot) 재화** 획득 & 소비
- 상점(Shop) — 아이템 구매
- 인벤토리 — 보유 아이템 관리
- 캐릭터(토끼) 커스터마이징

### ✔ 사용자 관리

- 회원가입 / 로그인 (JWT)
- 테마 변경
- 당근 히스토리 조회

---

## 🗂 서비스 구성 / 페이지 설명

### **1. Auth (로그인/회원가입)**

- JWT 기반 로그인 및 토큰 저장

### **2. Home / Dashboard**

- 무한 캘린더
- 선택 날짜 Todo 목록
- 캐릭터 UI + 현재 당근 표시
- 카테고리 필터링

### **3. Todo 상세**

- `/todos/:date`
- Todo CRUD, 완료 처리

### **4. Calendar View**

- 월별 이동

### **5. Shop**

- 아이템 목록 조회 / 구매

### **6. Inventory**

- 보유 아이템 조회 및 장착/해제

### **7. Profile (MyPage)**

- 테마 변경
- 당근 히스토리

---

## 🧾 데이터 구조 & 핵심 API

### 📌 주요 모델

```
User
- id
- username
- email
- carrot_balance
- profile

Todo
- id
- owner_id
- title
- description
- date
- completed
- categories (Many-to-many)

Category
- id
- name
- color

Item
- id
- name
- price
- type
- sprite_path

Inventory
- id
- user_id
- item_id
- equipped (bool)
```

---

### 📌 핵심 엔드포인트 요약

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | /auth/register | 회원가입 |
| POST | /auth/login | 로그인(JWT) |
| GET | /todos/?target_date=YYYY-MM-DD | 날짜별 Todo 조회 |
| PUT | /todos/{id} | Todo 수정 |
| POST | /todos/{id}/complete | 완료 처리 + 보상 지급 |
| GET | /shop/items | 아이템 목록 |
| POST | /shop/purchase | 아이템 구매 |
| GET | /inventory | 인벤토리 조회 |
| POST | /inventory/equip | 장착 처리 |

---

## 🔄 워크플로우 예시

### **할 일 완료 → 보상 지급 흐름**

1. 사용자가 Todo 완료 체크
2. 프론트: Optimistic UI로 즉시 완료 표시
3. 서버에 요청
    - `PUT /todos/{id}` : 완료 상태 업데이트
    - `POST /todos/{id}/complete` : 보상 트랜잭션
4. 서버 내부 처리
    - Todo.completed 업데이트
    - User.carrot_balance 증가
5. 서버 응답 → 프론트 전역 상태(userStore) 업데이트
6. 사용자는 상점에서 아이템 구매 가능
