# 测试环境Docker配置
FROM node:18-alpine AS frontend-test

WORKDIR /app

# 安装依赖
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# 拷贝前端代码
COPY . .

# 使用Vitest替代Jest
RUN npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @vitest/coverage-v8 --legacy-peer-deps

# 创建测试入口点
CMD ["npm", "run", "test:docker"]

# Java测试环境
FROM maven:3.9-eclipse-temurin-17 AS backend-test

WORKDIR /app

# 复制Maven配置
COPY backend/pom.xml ./backend/

# 复制Java源代码
COPY backend/src ./backend/src

# 运行测试
WORKDIR /app/backend
CMD ["mvn", "test"]
