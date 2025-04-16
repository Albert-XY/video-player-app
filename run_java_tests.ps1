# Java 后端测试脚本
Write-Host "============ 运行Java后端测试 ============" -ForegroundColor Cyan

# 进入Java后端目录
Set-Location -Path "$PSScriptRoot\backend"

# 确保Maven有正确配置
Write-Host "检查Maven配置..." -ForegroundColor Yellow
if (-Not (Test-Path -Path ".\apache-maven-3.9.6")) {
    Write-Host "没有找到Maven，请确保已安装Maven或添加到PATH中" -ForegroundColor Red
    exit 1
}

# 添加清理步骤
Write-Host "清理之前的构建..." -ForegroundColor Yellow
.\apache-maven-3.9.6\bin\mvn.cmd clean -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "Maven清理失败，请查看详细信息" -ForegroundColor Red
    exit 1
}

# 编译项目，但跳过测试
Write-Host "编译Java项目..." -ForegroundColor Yellow
.\apache-maven-3.9.6\bin\mvn.cmd compile -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "编译失败，请查看详细信息" -ForegroundColor Red
    exit 1
}

# 运行特定测试类，以隔离问题
Write-Host "运行特定测试..." -ForegroundColor Yellow
.\apache-maven-3.9.6\bin\mvn.cmd -Dtest=VideoServiceTest test

# 检查测试结果
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Java后端测试通过!" -ForegroundColor Green
} else {
    Write-Host "❌ Java后端测试失败，请查看详细信息" -ForegroundColor Red
}

# 返回原目录
Set-Location -Path $PSScriptRoot

Write-Host "============ Java后端测试完成 ============" -ForegroundColor Cyan
