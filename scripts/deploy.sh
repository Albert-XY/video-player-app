#!/bin/bash
# 视频播放器应用部署脚本

set -e  # 遇到错误立即退出

# 显示彩色消息的函数
function echo_color() {
  local color=$1
  local message=$2
  case $color in
    "green") echo -e "\033[0;32m$message\033[0m" ;;
    "red") echo -e "\033[0;31m$message\033[0m" ;;
    "yellow") echo -e "\033[0;33m$message\033[0m" ;;
    *) echo "$message" ;;
  esac
}

# 1. 进入项目目录
echo_color "green" "===== 1. 进入项目目录 ====="
cd /opt/video-player-app || {
  echo_color "red" "错误：无法进入项目目录"
  exit 1
}

# 2. 创建备份
echo_color "green" "===== 2. 创建配置备份 ====="
timestamp=$(date +%Y%m%d%H%M%S)
if [ -f docker-compose.prod.yml ]; then
  cp docker-compose.prod.yml "docker-compose.prod.yml.backup.$timestamp"
  echo_color "yellow" "已创建备份：docker-compose.prod.yml.backup.$timestamp"
else
  echo_color "yellow" "警告：docker-compose.prod.yml不存在，跳过备份"
fi

# 3. 更新代码
echo_color "green" "===== 3. 更新代码 ====="
git fetch --all
git reset --hard origin/master
echo_color "yellow" "代码已更新到最新版本"

# 4. 确保环境变量文件存在
echo_color "green" "===== 4. 检查环境变量 ====="
if [ ! -f .env ]; then
  echo_color "yellow" "创建.env文件..."
  cat > .env << EOF
POSTGRES_DB=${POSTGRES_DB:-video_player}
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
SECRET_KEY=${SECRET_KEY:-change_this_in_production}
EOF
  echo_color "yellow" ".env文件已创建"
else
  echo_color "yellow" ".env文件已存在"
fi

# 5. 拉取最新镜像
echo_color "green" "===== 5. 拉取Docker镜像 ====="
echo_color "yellow" "正在登录Docker Hub..."
if [ -n "${DOCKER_USERNAME}" ] && [ -n "${DOCKER_PASSWORD}" ]; then
  echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin
else
  echo_color "red" "警告：未提供Docker凭据，尝试使用现有登录状态"
fi

echo_color "yellow" "拉取最新镜像..."
docker pull albertxy/video-player-frontend:latest || echo_color "red" "警告：前端镜像拉取失败"
docker pull albertxy/video-player-backend:latest || echo_color "red" "警告：后端镜像拉取失败"
docker pull albertxy/video-player-nginx:latest || echo_color "red" "警告：Nginx镜像拉取失败"

# 6. 启动服务
echo_color "green" "===== 6. 启动服务 ====="
echo_color "yellow" "停止当前服务..."
docker-compose -f docker-compose.prod.yml down || echo_color "red" "警告：停止服务失败，继续部署"

echo_color "yellow" "启动新服务..."
docker-compose -f docker-compose.prod.yml up -d

# 7. 健康检查
echo_color "green" "===== 7. 进行健康检查 ====="
echo_color "yellow" "等待服务启动（30秒）..."
sleep 30

echo_color "yellow" "检查健康状态..."
health_status=$(curl -s http://localhost/api/health || echo '{"status":"unhealthy"}')
if [[ $health_status == *"healthy"* ]]; then
  echo_color "green" "部署成功：服务健康状态正常"
else
  echo_color "red" "部署警告：健康检查失败，可能需要进一步调查"
  echo_color "yellow" "健康检查响应: $health_status"
  
  # 错误处理（自动回滚）
  if [ -f "docker-compose.prod.yml.backup.$timestamp" ]; then
    echo_color "yellow" "正在回滚到之前的配置..."
    cp "docker-compose.prod.yml.backup.$timestamp" docker-compose.prod.yml
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
    echo_color "yellow" "回滚完成"
  fi
fi

# 8. 清理备份
echo_color "green" "===== 8. 清理旧备份 ====="
# 保留最近10个备份，删除更旧的
ls -t docker-compose.prod.yml.backup.* 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
echo_color "yellow" "备份清理完成"

echo_color "green" "===== 部署流程完成 ====="
