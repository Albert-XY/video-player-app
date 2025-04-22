# 多阶段构建：前端（Next.js/React）、后端（Spring Boot）、Python ML
# 参考 docker/app.Dockerfile，适配CI/CD在根目录寻找Dockerfile

# Stage 1: Build the frontend (Next.js/React)
FROM node:18 as frontend-build
WORKDIR /app/frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build the backend (Spring Boot)
FROM maven:3.9.6-eclipse-temurin-17 as backend-build
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn package -DskipTests

# Stage 3: Python env for ML (if needed)
FROM python:3.10-slim as python-env
WORKDIR /app/ml
COPY backend/ml/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ml /app/ml

# Stage 4: Final image
FROM eclipse-temurin:17-jdk-alpine as prod
WORKDIR /app

# 前端静态资源
COPY --from=frontend-build /app/frontend/.next /app/frontend/.next
COPY --from=frontend-build /app/frontend/public /app/frontend/public
COPY --from=frontend-build /app/frontend/node_modules /app/frontend/node_modules
COPY --from=frontend-build /app/frontend/package.json /app/frontend/package.json

# 后端jar包
COPY --from=backend-build /app/backend/target/*.jar /app/app.jar

# Python ML
COPY --from=python-env /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=python-env /app/ml /app/ml

EXPOSE 8080

# 启动Spring Boot后端
CMD ["java", "-jar", "/app/app.jar"]
