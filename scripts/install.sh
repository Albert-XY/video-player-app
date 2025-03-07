#!/bin/bash
# 视频播放器应用一键安装脚本
# 此脚本可以直接从GitHub下载并执行: 
# curl -fsSL https://raw.githubusercontent.com/Albert-XY/video-player-app/master/scripts/install.sh | bash

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # 无颜色

echo -e "${GREEN}===== 视频播放器应用安装工具 =====${NC}"
echo "开始时间: $(date)"

# 1. 检查必要的依赖
echo -e "${YELLOW}1. 检查依赖...${NC}"
needed_commands=("docker" "docker-compose" "git" "curl")
missing_commands=()

for cmd in "${needed_commands[@]}"; do
  if ! command -v $cmd &> /dev/null; then
    missing_commands+=($cmd)
  fi
done

if [ ${#missing_commands[@]} -ne 0 ]; then
  echo -e "${RED}缺少必要的依赖: ${missing_commands[*]}${NC}"
  echo "请安装缺少的依赖后重试"
  exit 1
else
  echo "所有必要的依赖都已安装"
fi

# 2. 设置安装目录
echo -e "${YELLOW}2. 设置安装目录...${NC}"
DEFAULT_DIR="/opt/video-player-app"
read -p "请输入安装目录 [$DEFAULT_DIR]: " INSTALL_DIR
INSTALL_DIR=${INSTALL_DIR:-$DEFAULT_DIR}

# 3. 创建和准备目录
echo -e "${YELLOW}3. 准备安装目录...${NC}"
if [ ! -d "$INSTALL_DIR" ]; then
  echo "创建目录: $INSTALL_DIR"
  sudo mkdir -p "$INSTALL_DIR"
  sudo chown $(whoami):$(whoami) "$INSTALL_DIR"
else
  echo "目录已存在: $INSTALL_DIR"
  read -p "是否继续安装? [y/N]: " CONTINUE
  if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
    echo "安装已取消"
    exit 0
  fi
fi

# 4. 克隆或更新代码
echo -e "${YELLOW}4. 获取应用代码...${NC}"
cd "$INSTALL_DIR"

if [ -d .git ]; then
  echo "Git仓库已存在，更新代码"
  git fetch --all
  git reset --hard origin/master
else
  echo "克隆代码仓库"
  git clone https://github.com/Albert-XY/video-player-app.git .
fi

# 5. 设置环境变量
echo -e "${YELLOW}5. 配置环境变量...${NC}"
if [ ! -f .env ]; then
  echo "创建.env文件"
  
  # 数据库设置
  read -p "PostgreSQL数据库名 [video_player]: " DB_NAME
  DB_NAME=${DB_NAME:-video_player}
  
  read -p "PostgreSQL用户名 [postgres]: " DB_USER
  DB_USER=${DB_USER:-postgres}
  
  read -p "PostgreSQL密码: " DB_PASSWORD
  
  # 生成随机密钥
  SECRET_KEY=$(openssl rand -hex 32)
  
  # 创建.env文件
  cat > .env << EOF
POSTGRES_DB=$DB_NAME
POSTGRES_USER=$DB_USER
POSTGRES_PASSWORD=$DB_PASSWORD
SECRET_KEY=$SECRET_KEY
EOF
  echo ".env文件已创建"
else
  echo ".env文件已存在，跳过配置"
  read -p "是否覆盖现有配置文件? [y/N]: " OVERWRITE_ENV
  if [[ $OVERWRITE_ENV =~ ^[Yy]$ ]]; then
    # 保存备份
    cp .env .env.backup.$(date +%Y%m%d%H%M%S)
    
    # 数据库设置
    read -p "PostgreSQL数据库名 [video_player]: " DB_NAME
    DB_NAME=${DB_NAME:-video_player}
    
    read -p "PostgreSQL用户名 [postgres]: " DB_USER
    DB_USER=${DB_USER:-postgres}
    
    read -p "PostgreSQL密码: " DB_PASSWORD
    
    # 生成随机密钥
    SECRET_KEY=$(openssl rand -hex 32)
    
    # 创建.env文件
    cat > .env << EOF
POSTGRES_DB=$DB_NAME
POSTGRES_USER=$DB_USER
POSTGRES_PASSWORD=$DB_PASSWORD
SECRET_KEY=$SECRET_KEY
EOF
    echo "新的.env文件已创建"
  fi
fi

# 6. Docker Hub设置
echo -e "${YELLOW}6. Docker Hub配置...${NC}"
read -p "是否使用自定义Docker Hub账号? [y/N]: " USE_CUSTOM_DOCKER
if [[ $USE_CUSTOM_DOCKER =~ ^[Yy]$ ]]; then
  read -p "Docker Hub用户名: " DOCKER_USERNAME
  read -s -p "Docker Hub密码: " DOCKER_PASSWORD
  echo ""
  
  echo "登录Docker Hub..."
  echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
else
  echo "使用默认Docker Hub账号"
  DOCKER_USERNAME="albertxy"
fi

# 7. 部署服务
echo -e "${YELLOW}7. 部署服务...${NC}"
echo "拉取Docker镜像..."
docker pull "$DOCKER_USERNAME/video-player-frontend:latest" || echo "警告: 前端镜像拉取失败"
docker pull "$DOCKER_USERNAME/video-player-backend:latest" || echo "警告: 后端镜像拉取失败"
docker pull "$DOCKER_USERNAME/video-player-nginx:latest" || echo "警告: Nginx镜像拉取失败"

echo "启动服务..."
docker-compose -f docker-compose.prod.yml down || echo "注意: 没有运行中的服务"
docker-compose -f docker-compose.prod.yml up -d

# 8. 配置自启动
echo -e "${YELLOW}8. 配置服务自启动...${NC}"
read -p "是否配置服务开机自启动? [Y/n]: " AUTOSTART
if [[ ! $AUTOSTART =~ ^[Nn]$ ]]; then
  SYSTEMD_DIR="/etc/systemd/system"
  SYSTEMD_FILE="$SYSTEMD_DIR/video-player.service"
  
  echo "创建systemd服务..."
  sudo bash -c "cat > $SYSTEMD_FILE << EOF
[Unit]
Description=Video Player Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF"

  echo "启用并启动服务..."
  sudo systemctl daemon-reload
  sudo systemctl enable video-player.service
  sudo systemctl start video-player.service
  
  echo "服务已配置为开机自启动"
fi

# 9. 检查服务健康状态
echo -e "${YELLOW}9. 检查服务健康状态...${NC}"
echo "等待服务启动 (30秒)..."
sleep 30

echo "检查健康状态..."
health_status=$(curl -s http://localhost/api/health || echo '{"status":"unhealthy"}')
if [[ $health_status == *"healthy"* ]]; then
  echo -e "${GREEN}安装成功: 服务健康状态正常${NC}"
else
  echo -e "${RED}警告: 健康检查失败${NC}"
  echo "健康检查响应: $health_status"
fi

# 10. 显示访问信息
echo -e "${GREEN}===== 安装完成 =====${NC}"
echo "应用已安装在: $INSTALL_DIR"
echo "Web界面可通过以下地址访问:"
echo "  http://$(hostname -I | awk '{print $1}' | tr -d '[:space:]')"
echo "  http://localhost"

echo -e "${YELLOW}有用的命令:${NC}"
echo "  查看容器状态: docker ps"
echo "  查看服务日志: docker-compose -f $INSTALL_DIR/docker-compose.prod.yml logs -f"
echo "  重启服务: docker-compose -f $INSTALL_DIR/docker-compose.prod.yml restart"
echo "  停止服务: docker-compose -f $INSTALL_DIR/docker-compose.prod.yml down"
echo "  启动服务: docker-compose -f $INSTALL_DIR/docker-compose.prod.yml up -d"

echo "完成时间: $(date)"
