# 简化前端测试脚本
Write-Host "============ 运行前端简化测试 ============" -ForegroundColor Cyan

# 设置环境变量
$env:NODE_OPTIONS = "--no-warnings"

# 运行前端测试
Write-Host "运行VideoPlayer组件测试..." -ForegroundColor Yellow
npx jest --config=jest.simple.config.js __tests__/components/VideoPlayer.test.tsx

# 测试结果
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 前端测试通过!" -ForegroundColor Green
} else {
    Write-Host "❌ 前端测试失败，请查看详细信息" -ForegroundColor Red
}

Write-Host "============ 前端测试完成 ============" -ForegroundColor Cyan
