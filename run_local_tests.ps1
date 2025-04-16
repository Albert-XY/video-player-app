# 直接运行本地测试，绕过npm网络问题
Write-Host "============ 开始运行本地测试 ============" -ForegroundColor Cyan

# 使用npx直接运行
Write-Host "🧪 使用npx直接运行Vitest测试..." -ForegroundColor Yellow
$env:NODE_ENV = 'test' 
$env:NEXT_PUBLIC_API_URL = 'http://localhost:8080'

# 执行测试
npx vitest run --config=".\vitest.config.ts"

# 判断测试结果
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 测试成功通过！" -ForegroundColor Green
} else {
    Write-Host "❌ 测试未通过，请检查错误信息" -ForegroundColor Red
}

Write-Host "============ 测试完成 ============" -ForegroundColor Cyan
