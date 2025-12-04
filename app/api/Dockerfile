FROM python:3.10-slim

WORKDIR /code

# AMP 루트에 있는 requirements.txt 복사 (context가 . 이니까 이제 보임)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# 프로젝트 전체 복사 (app/api 기준 말고 AMP 기준)
COPY . .

# FastAPI 실행 (app/api/main.py에 app 객체 있다고 가정)
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "app.api.main:app", "-b", "0.0.0.0:8000"]

