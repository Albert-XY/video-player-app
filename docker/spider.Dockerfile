FROM python:3.9-slim

WORKDIR /app

# 安装依赖
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制需要的文件
COPY python/requirements.txt .
COPY python/video_scraper /app/video_scraper/
COPY python/config.py .
COPY python/run_spider.py .
COPY python/.env.spider /app/.env

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 创建必要的目录
RUN mkdir -p /app/downloads /app/temp /app/cache

# 设置环境变量
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# 设置入口点
ENTRYPOINT ["python", "run_spider.py"]
