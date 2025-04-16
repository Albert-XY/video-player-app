#!/usr/bin/env pwsh
# 统一测试运行脚本

Write-Host "============ 开始测试视频播放器应用 ============" -ForegroundColor Cyan

# 全局变量，用于追踪测试结果
$testResults = @{
    "前端" = $false
    "Python后端" = $false
    "Java后端" = $false
}

# 1. 运行前端测试
Write-Host "🧪 运行前端 (Next.js) 测试..." -ForegroundColor Blue
try {
    & "$PSScriptRoot\run_frontend_tests.ps1"
    if ($LASTEXITCODE -eq 0) {
        $testResults["前端"] = $true
    }
} catch {
    Write-Host "❌ 前端测试执行错误: $_" -ForegroundColor Red
}

# 2. 运行Python后端测试
Write-Host "`n🧪 运行Python后端测试..." -ForegroundColor Blue
try {
    & "$PSScriptRoot\run_python_tests.ps1"
    if ($LASTEXITCODE -eq 0) {
        $testResults["Python后端"] = $true
    }
} catch {
    Write-Host "❌ Python后端测试执行错误: $_" -ForegroundColor Red
}

# 3. 运行Java后端测试
Write-Host "`n🧪 运行Java后端测试..." -ForegroundColor Blue
try {
    & "$PSScriptRoot\run_java_tests.ps1"
    if ($LASTEXITCODE -eq 0) {
        $testResults["Java后端"] = $true
    }
} catch {
    Write-Host "❌ Java后端测试执行错误: $_" -ForegroundColor Red
}

# 汇总测试结果
Write-Host "`n============ 测试结果汇总 ============" -ForegroundColor Cyan
$allPassed = $true

foreach ($test in $testResults.GetEnumerator()) {
    if ($test.Value) {
        Write-Host "✅ $($test.Key) 测试通过" -ForegroundColor Green
    } else {
        Write-Host "❌ $($test.Key) 测试失败" -ForegroundColor Red
        $allPassed = $false
    }
}

# 输出最终结果和建议
if ($allPassed) {
    Write-Host "`n✅ 所有测试通过！" -ForegroundColor Green
} else {
    Write-Host "`n❌ 部分测试失败，请检查上述输出并修复问题" -ForegroundColor Red
    
    Write-Host "`n排查问题建议:" -ForegroundColor Yellow
    Write-Host "1. 前端测试问题: 检查Jest配置和组件props是否匹配" -ForegroundColor Yellow
    Write-Host "2. Python测试问题: 检查API路由和Flask配置" -ForegroundColor Yellow
    Write-Host "3. Java测试问题: 检查依赖注入和模型构造函数" -ForegroundColor Yellow
    Write-Host "4. 所有失败的测试: 使用-Dtest=具体测试类名 来隔离测试特定类" -ForegroundColor Yellow
}

Write-Host "`n============ 测试完成 ============" -ForegroundColor Cyan
