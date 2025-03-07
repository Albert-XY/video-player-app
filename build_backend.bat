@echo off
echo 准备构建后端Docker镜像...

REM 备份当前的.dockerignore文件（如果存在）
if exist .dockerignore (
  echo 备份当前的.dockerignore文件...
  copy .dockerignore .dockerignore.bak
)

REM 使用后端专用的.dockerignore文件
echo 使用后端专用的.dockerignore文件...
copy .dockerignore.backend .dockerignore

REM 构建后端Docker镜像
echo 开始构建后端Docker镜像...
docker build -t albertxy/video-player-backend:latest -f Dockerfile.backend .

REM 还原原始的.dockerignore文件
echo 还原原始的.dockerignore文件...
if exist .dockerignore.bak (
  copy .dockerignore.bak .dockerignore
  del .dockerignore.bak
)

echo 构建完成！
