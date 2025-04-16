# 简化的前端测试脚本
Write-Host "============ 运行前端组件测试 ============" -ForegroundColor Cyan

# 运行组件测试
Write-Host "运行VideoPlayer组件测试..." -ForegroundColor Yellow
$env:NODE_OPTIONS="--no-warnings"
npx jest --config=jest.modern.config.js __tests__/components/VideoPlayer.test.tsx --verbose

# 检查测试结果
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ VideoPlayer测试通过!" -ForegroundColor Green
} else {
    Write-Host "❌ VideoPlayer测试失败，查看错误信息" -ForegroundColor Red
}

Write-Host "============ 测试完成 ============" -ForegroundColor Cyan
