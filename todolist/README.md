
### 설치해야할 라이브러리
pip install fastapi
pip install "uvicorn[standard]"
pip install sqlalchemy
pip install psycopg2-binary
pip install "python-jose[cryptography]"
pip install "passlib[bcrypt]"
npx expo install expo-secure-store
npm install axios

-> 모두 설치 한 후에 
pip uninstall bcrypt
pip install bcrypt==4.1.2
해서 bcrypt 라이브러리는 따로 재설치.

### 실행하는 방법
uvicorn app.main:app --reload 
npx start -> w 입력 (웹으로 접속)
-> cmd 두 개로 각각 명령어 입력

### 전체 파일 구조

- main.py
총 관리자, FastAPI 접속 
- auth.py 
사용자 인증, 회원가입 등 모든 API 엔드포인트 관리
- crud.py
데이터베이스 관련 모든 작업
- schemas.py
데이터 유효성 검사 및 구조 정의
* 로그인 제약사항 (이메일 유효성 검사, 비밀번호 세부사항)
- models.py
데이터베이스의 테이블 구조 정의 
users 테이블 (id, email, password)
- security.py
사용자 인증 및 보안 관련 로직
* 비밀번로 해싱 
* JWT 생성
- database.py
데이터베이스 연결 관련 설정

*** 로그인 테스트 시에 팀장에게 공인IP 알리기
> https://whatismyipaddress.com/
여기 접속하면 공인IP 알 수 있음.