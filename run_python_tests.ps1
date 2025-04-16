# Python后端测试脚本
Write-Host "============ 运行Python后端测试 ============" -ForegroundColor Cyan

# 切换到Python目录
Set-Location (Join-Path $PSScriptRoot "python")

# 确保Flask和测试依赖已安装
Write-Host "正在检查必要的Python依赖..." -ForegroundColor Yellow
python -m pip install Flask==2.3.2 Flask-Cors==4.0.0 pytest==7.3.1 requests==2.31.0 PyJWT==2.7.0

# 运行Python测试
Write-Host "正在运行Python测试..." -ForegroundColor Yellow
$testOutput = python -m pytest tests/simple_test.py -v
Write-Host $testOutput

# 检查测试结果
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Python测试通过!" -ForegroundColor Green
} else {
    Write-Host "❌ Python测试失败，请查看上面的详细信息" -ForegroundColor Red
}

# 返回项目根目录
Set-Location $PSScriptRoot

Write-Host "============ Python测试完成 ============" -ForegroundColor Cyan
