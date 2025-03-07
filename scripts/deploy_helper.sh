#!/bin/bash
# 视频播放器应用部署辅助脚本
# 这个脚本用于在服务器上直接执行，绕过SSH连接问题

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # 无颜色

echo -e "${GREEN}==== 视频播放器应用部署工具 ====${NC}"
echo "开始时间: $(date)"

# 1. 确保目录存在
echo -e "${YELLOW}1. 检查和准备目录...${NC}"
APP_DIR="/opt/video-player-app"

if [ ! -d "$APP_DIR" ]; then
  echo "创建应用目录: $APP_DIR"
  sudo mkdir -p "$APP_DIR"
  sudo chown $(whoami):$(whoami) "$APP_DIR"
else
  echo "应用目录已存在: $APP_DIR"
fi

# 2. 进入应用目录
echo -e "${YELLOW}2. 进入应用目录...${NC}"
cd "$APP_DIR" || {
  echo -e "${RED}无法进入目录 $APP_DIR${NC}"
  exit 1
}

# 3. 备份现有配置
echo -e "${YELLOW}3. 备份现有配置...${NC}"
timestamp=$(date +%Y%m%d%H%M%S)
if [ -f docker-compose.prod.yml ]; then
  cp docker-compose.prod.yml "docker-compose.prod.yml.backup.$timestamp"
  echo "已创建备份: docker-compose.prod.yml.backup.$timestamp"
else
  echo "未找到docker-compose.prod.yml，跳过备份"
fi

# 4. 检查Git仓库
echo -e "${YELLOW}4. 检查Git仓库...${NC}"
if [ -d .git ]; then
  echo "Git仓库已存在，更新代码"
  git fetch --all
  git reset --hard origin/master
else
  echo "初始化Git仓库"
  git init
  git remote add origin https://github.com/Albert-XY/video-player-app.git
  git fetch
  git checkout -f master
fi

# 5. 准备环境变量
echo -e "${YELLOW}5. 准备环境变量...${NC}"
if [ ! -f .env ]; then
  echo "创建.env文件"
  cat > .env << EOF
POSTGRES_DB=${POSTGRES_DB:-video_player}
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
SECRET_KEY=${SECRET_KEY:-default_production_key_change_me}
EOF
  echo ".env文件已创建"
else
  echo ".env文件已存在"
fi

# 6. 登录Docker Hub
echo -e "${YELLOW}6. 登录Docker Hub...${NC}"
if [ -n "$DOCKER_USERNAME" ] && [ -n "$DOCKER_PASSWORD" ]; then
  echo "使用提供的凭据登录Docker Hub"
  echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
else
  echo "环境变量中未找到Docker凭据，请手动输入"
  docker login
fi

# 7. 拉取最新镜像
echo -e "${YELLOW}7. 拉取最新Docker镜像...${NC}"
DOCKER_USERNAME=${DOCKER_USERNAME:-albertxy}
echo "使用用户名: $DOCKER_USERNAME"

docker pull "$DOCKER_USERNAME/video-player-frontend:latest" || echo "警告: 前端镜像拉取失败"
docker pull "$DOCKER_USERNAME/video-player-backend:latest" || echo "警告: 后端镜像拉取失败"
docker pull "$DOCKER_USERNAME/video-player-nginx:latest" || echo "警告: Nginx镜像拉取失败"

# 8. 启动服务
echo -e "${YELLOW}8. 启动服务...${NC}"
docker-compose -f docker-compose.prod.yml down || echo "警告: 停止服务失败，继续部署"
docker-compose -f docker-compose.prod.yml up -d

# 9. 检查服务状态
echo -e "${YELLOW}9. 等待服务启动并检查状态...${NC}"
echo "等待30秒..."
sleep 30

echo "检查健康状态..."
health_status=$(curl -s http://localhost/api/health || echo '{"status":"unhealthy"}')
if [[ $health_status == *"healthy"* ]]; then
  echo -e "${GREEN}部署成功: 服务健康状态正常${NC}"
else
  echo -e "${RED}部署警告: 健康检查失败${NC}"
  echo "健康检查响应: $health_status"
  
  # 错误处理（自动回滚）
  if [ -f "docker-compose.prod.yml.backup.$timestamp" ]; then
    echo "正在回滚到之前的配置..."
    cp "docker-compose.prod.yml.backup.$timestamp" docker-compose.prod.yml
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
    echo "回滚完成"
  fi
fi

# 10. 清理
echo -e "${YELLOW}10. 清理...${NC}"
# 保留最近10个备份，删除更旧的
find . -name "docker-compose.prod.yml.backup.*" | sort -r | tail -n +11 | xargs rm -f 2>/dev/null || true
echo "备份文件清理完成"

# 11. 显示容器状态
echo -e "${YELLOW}11. 显示容器状态...${NC}"
docker ps

# 结束
echo -e "${GREEN}==== 部署完成 ====${NC}"
echo "结束时间: $(date)"
echo "如果需要查看容器日志，请使用: docker-compose -f docker-compose.prod.yml logs -f"
