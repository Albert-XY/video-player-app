# 前端测试脚本
Write-Host "============ 运行前端测试 ============" -ForegroundColor Cyan

# 确保安装了必要的依赖
Write-Host "正在安装必要的测试依赖..." -ForegroundColor Yellow

# 使用 --force 选项解决依赖冲突问题
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event --legacy-peer-deps --force

# 重新构建测试环境
Write-Host "准备测试环境..." -ForegroundColor Yellow
$env:NODE_OPTIONS = "--no-warnings"

# 运行前端测试
Write-Host "运行前端测试..." -ForegroundColor Yellow
npx jest --no-cache

# 测试结果
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 前端测试通过!" -ForegroundColor Green
} else {
    Write-Host "❌ 前端测试失败，请查看详细信息" -ForegroundColor Red
}

Write-Host "============ 前端测试完成 ============" -ForegroundColor Cyan
