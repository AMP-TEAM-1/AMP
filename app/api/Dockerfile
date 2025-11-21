# app/api/Dockerfile
FROM python:3.10-slim

WORKDIR /code

# requirements 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# app 폴더 통째로 복사 (app/api/main.py 그대로 유지)
COPY app ./app

# Gunicorn으로 FastAPI 실행 (패키지 기준)
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "app.api.main:app", "-b", "0.0.0.0:8000"]

