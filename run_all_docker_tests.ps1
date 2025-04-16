# 使用Docker运行所有测试的脚本
Write-Host "============ 开始Docker测试环境 ============" -ForegroundColor Cyan

# 确保Docker正在运行
$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Docker未运行，请先启动Docker Desktop然后重试" -ForegroundColor Yellow
    exit 1
}

# 构建测试镜像
Write-Host "构建测试Docker镜像..." -ForegroundColor Yellow
docker-compose -f docker/docker-compose.test.yml build

# 运行前端测试
Write-Host "运行前端测试..." -ForegroundColor Yellow
docker-compose -f docker/docker-compose.test.yml run frontend-test

# 获取前端测试结果
$frontendTestResult = $LASTEXITCODE
if ($frontendTestResult -eq 0) {
    Write-Host "✅ 前端测试通过！" -ForegroundColor Green
} else {
    Write-Host "❌ 前端测试失败，请查看日志" -ForegroundColor Red
}

# 运行后端测试
Write-Host "运行后端测试..." -ForegroundColor Yellow
docker-compose -f docker/docker-compose.test.yml run backend-test

# 获取后端测试结果
$backendTestResult = $LASTEXITCODE
if ($backendTestResult -eq 0) {
    Write-Host "✅ 后端测试通过！" -ForegroundColor Green
} else {
    Write-Host "❌ 后端测试失败，请查看日志" -ForegroundColor Red
}

# 清理测试容器
Write-Host "清理测试容器..." -ForegroundColor Yellow
docker-compose -f docker/docker-compose.test.yml down

# 总结测试结果
Write-Host "============ 测试结果摘要 ============" -ForegroundColor Cyan
if ($frontendTestResult -eq 0 -and $backendTestResult -eq 0) {
    Write-Host "🎉 所有测试通过！" -ForegroundColor Green
} else {
    Write-Host "⚠️ 部分测试失败，请查看上面的日志获取详细信息" -ForegroundColor Yellow
}

Write-Host "============ 测试完成 ============" -ForegroundColor Cyan
