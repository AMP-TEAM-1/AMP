# ---- Frontend Build Stage ----
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 설치
COPY package.json yarn.lock* package-lock.json* ./
RUN yarn install --frozen-lockfile || npm install

# 전체 코드 복사
COPY . .

# Expo Web 빌드
RUN npx expo export -p web

# ---- Frontend Deploy Stage ----
FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
