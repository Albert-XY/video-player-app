# 准备构建后端Docker镜像
Write-Host "准备构建后端Docker镜像..." -ForegroundColor Green

# 备份当前的.dockerignore文件（如果存在）
if (Test-Path .dockerignore) {
    Write-Host "备份当前的.dockerignore文件..." -ForegroundColor Yellow
    Copy-Item .dockerignore .dockerignore.bak
}

# 使用后端专用的.dockerignore文件
Write-Host "使用后端专用的.dockerignore文件..." -ForegroundColor Yellow
Copy-Item .dockerignore.backend .dockerignore

# 构建后端Docker镜像
Write-Host "开始构建后端Docker镜像..." -ForegroundColor Green
docker build -t albertxy/video-player-backend:latest -f Dockerfile.backend .

# 还原原始的.dockerignore文件
Write-Host "还原原始的.dockerignore文件..." -ForegroundColor Yellow
if (Test-Path .dockerignore.bak) {
    Copy-Item .dockerignore.bak .dockerignore
    Remove-Item .dockerignore.bak
}

Write-Host "构建完成！" -ForegroundColor Green
