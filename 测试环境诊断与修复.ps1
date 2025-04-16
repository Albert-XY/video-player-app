# 视频播放器应用 - 测试环境诊断与修复工具
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "       视频播放器应用 - 测试环境诊断与修复       " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# 1. 检查Node和npm版本
Write-Host "`n[1] 检查Node和npm版本..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    $npmVersion = npm -v
    Write-Host "✅ Node版本: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 无法检测Node或npm版本，请确保它们已正确安装" -ForegroundColor Red
}

# 2. 检查Docker状态
Write-Host "`n[2] 检查Docker状态..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker正在运行" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker未运行，某些测试功能将不可用" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 未检测到Docker，某些测试功能将不可用" -ForegroundColor Red
}

# 3. 检查Jest配置文件
Write-Host "`n[3] 检查Jest配置文件..." -ForegroundColor Yellow
$jestConfigPath = ".\jest.simple.config.js"
if (Test-Path $jestConfigPath) {
    Write-Host "✅ Jest配置文件存在: $jestConfigPath" -ForegroundColor Green
} else {
    Write-Host "❌ Jest配置文件不存在" -ForegroundColor Red
}

# 4. 检查Vitest配置文件
Write-Host "`n[4] 检查Vitest配置文件..." -ForegroundColor Yellow
$vitestConfigPath = ".\vitest.config.ts"
if (Test-Path $vitestConfigPath) {
    Write-Host "✅ Vitest配置文件存在: $vitestConfigPath" -ForegroundColor Green
} else {
    Write-Host "❌ Vitest配置文件不存在" -ForegroundColor Red
}

# 5. 检查测试文件夹
Write-Host "`n[5] 检查测试文件目录..." -ForegroundColor Yellow
$testsDir = "./__tests__"
if (Test-Path $testsDir) {
    $testCount = (Get-ChildItem -Recurse -File -Path $testsDir -Filter "*.test.*").Count
    Write-Host "✅ 测试目录存在，包含 $testCount 个测试文件" -ForegroundColor Green
} else {
    Write-Host "❌ 测试目录不存在" -ForegroundColor Red
}

# 6. 测试选项菜单
Write-Host "`n==============================================" -ForegroundColor Cyan
Write-Host "       可用测试选项（请选择一个数字）         " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "1. 使用Jest运行前端测试 (不依赖Vitest)" -ForegroundColor White
Write-Host "2. 仅检查测试文件语法错误 (不运行测试)" -ForegroundColor White
Write-Host "3. 使用npx直接运行Vitest (绕过npm脚本)" -ForegroundColor White
Write-Host "4. 使用Docker运行测试 (需要Docker运行中)" -ForegroundColor White
Write-Host "5. 生成测试报告 (当前测试环境状态)" -ForegroundColor White
Write-Host "0. 退出" -ForegroundColor White

$choice = Read-Host "`n请输入选项编号"

switch ($choice) {
    "1" {
        Write-Host "`n正在使用Jest运行测试..." -ForegroundColor Yellow
        npx jest --config=jest.simple.config.js
    }
    "2" {
        Write-Host "`n正在检查测试文件语法..." -ForegroundColor Yellow
        npx tsc --noEmit ./__tests__/**/*.ts ./__tests__/**/*.tsx
    }
    "3" {
        Write-Host "`n正在使用npx直接运行Vitest..." -ForegroundColor Yellow
        npx vitest run
    }
    "4" {
        Write-Host "`n正在使用Docker运行测试..." -ForegroundColor Yellow
        if ($LASTEXITCODE -eq 0) {
            .\run_all_docker_tests.ps1
        } else {
            Write-Host "❌ Docker未运行，无法使用此选项" -ForegroundColor Red
        }
    }
    "5" {
        Write-Host "`n正在生成测试环境报告..." -ForegroundColor Yellow
        
        # 创建报告目录
        $reportDir = "./test-report"
        if (-not (Test-Path $reportDir)) {
            New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
        }
        
        # 生成报告文件
        $reportFile = "$reportDir/test-env-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
        
        "视频播放器应用 - 测试环境报告" | Out-File -FilePath $reportFile
        "生成时间: $(Get-Date)" | Out-File -FilePath $reportFile -Append
        "=======================================`n" | Out-File -FilePath $reportFile -Append
        
        "1. 系统信息:" | Out-File -FilePath $reportFile -Append
        "Node版本: $nodeVersion" | Out-File -FilePath $reportFile -Append
        "npm版本: $npmVersion" | Out-File -FilePath $reportFile -Append
        "Docker状态: $(if ($LASTEXITCODE -eq 0) { '运行中' } else { '未运行' })" | Out-File -FilePath $reportFile -Append
        
        "2. 配置文件状态:" | Out-File -FilePath $reportFile -Append
        "Jest配置: $(if (Test-Path $jestConfigPath) { '存在' } else { '不存在' })" | Out-File -FilePath $reportFile -Append
        "Vitest配置: $(if (Test-Path $vitestConfigPath) { '存在' } else { '不存在' })" | Out-File -FilePath $reportFile -Append
        
        "3. 测试文件统计:" | Out-File -FilePath $reportFile -Append
        if (Test-Path $testsDir) {
            "测试目录: 存在" | Out-File -FilePath $reportFile -Append
            "测试文件数量: $testCount" | Out-File -FilePath $reportFile -Append
        } else {
            "测试目录: 不存在" | Out-File -FilePath $reportFile -Append
        }
        
        "4. 依赖状态:" | Out-File -FilePath $reportFile -Append
        $packageJson = Get-Content -Raw -Path "./package.json" | ConvertFrom-Json
        "Jest版本: $($packageJson.devDependencies.jest)" | Out-File -FilePath $reportFile -Append
        "Vitest版本: $($packageJson.devDependencies.vitest)" | Out-File -FilePath $reportFile -Append
        
        Write-Host "✅ 测试环境报告已生成: $reportFile" -ForegroundColor Green
    }
    "0" {
        Write-Host "退出程序" -ForegroundColor Yellow
        return
    }
    default {
        Write-Host "❌ 无效的选项" -ForegroundColor Red
    }
}

Write-Host "`n测试环境诊断完成！" -ForegroundColor Cyan
