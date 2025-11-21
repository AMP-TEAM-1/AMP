# app/api/Dockerfile
FROM python:3.10-slim

WORKDIR /code

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Gunicorn 설치
RUN pip install gunicorn

COPY . .

# Gunicorn으로 FastAPI 앱 실행
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "-b", "0.0.0.0:8000"]
