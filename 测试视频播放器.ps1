# 视频播放器功能测试脚本
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "       视频播放器功能测试       " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# 检查前端服务是否运行
Write-Host "`n[1] 检查前端服务状态..." -ForegroundColor Yellow
$frontendRunning = $false

try {
    $testResponse = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($testResponse.StatusCode -eq 200) {
        $frontendRunning = $true
        Write-Host "✅ 前端服务正在运行 (http://localhost:3001)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ 前端服务未运行" -ForegroundColor Red
}

if (-not $frontendRunning) {
    Write-Host "`n正在启动前端服务..." -ForegroundColor Yellow
    Start-Process -FilePath "powershell" -ArgumentList "-Command cd '$PSScriptRoot'; npm run dev" -WindowStyle Normal
    
    # 等待服务启动
    $attempts = 0
    $maxAttempts = 10
    $success = $false
    
    while ($attempts -lt $maxAttempts -and -not $success) {
        $attempts++
        Write-Host "  等待前端服务启动 (尝试 $attempts/$maxAttempts)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
        
        try {
            $testResponse = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($testResponse.StatusCode -eq 200) {
                $success = $true
                Write-Host "✅ 前端服务已成功启动" -ForegroundColor Green
            }
        } catch {
            # 继续等待
        }
    }
    
    if (-not $success) {
        Write-Host "❌ 前端服务启动失败，请手动运行 'npm run dev'" -ForegroundColor Red
        return
    }
}

# 打开视频播放器测试页面
Write-Host "`n[2] 打开视频播放器测试页面..." -ForegroundColor Yellow
$testPlayerUrl = "http://localhost:3001/test-player"

try {
    Start-Process $testPlayerUrl
    Write-Host "✅ 已在浏览器中打开测试页面: $testPlayerUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ 无法自动打开浏览器，请手动访问: $testPlayerUrl" -ForegroundColor Red
}

# 测试选项菜单
Write-Host "`n==============================================" -ForegroundColor Cyan
Write-Host "       测试选项（请选择一个数字）         " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "1. 运行基本视频播放器功能测试" -ForegroundColor White
Write-Host "2. 生成播放器测试报告" -ForegroundColor White
Write-Host "0. 退出" -ForegroundColor White

$choice = Read-Host "`n请输入选项编号"

switch ($choice) {
    "1" {
        Write-Host "`n正在运行视频播放器功能测试..." -ForegroundColor Yellow
        
        # 测试模拟API能否正常工作
        try {
            $apiTest = Invoke-WebRequest -Uri "http://localhost:3001/api/videos" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($apiTest.StatusCode -eq 200) {
                Write-Host "✅ API接口测试通过" -ForegroundColor Green
            } else {
                Write-Host "⚠️ API接口返回意外状态码: $($apiTest.StatusCode)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️ API接口测试失败，模拟数据将用于前端测试" -ForegroundColor Yellow
        }
        
        Write-Host "`n功能测试步骤:" -ForegroundColor Cyan
        Write-Host "1. 视频加载测试: 视频应该能够成功加载并显示播放器控件" -ForegroundColor White
        Write-Host "2. 播放测试: 点击播放按钮，视频应开始播放" -ForegroundColor White
        Write-Host "3. 暂停测试: 点击暂停按钮，视频应暂停播放" -ForegroundColor White
        Write-Host "4. 列表切换测试: 点击其他视频，播放器应加载新视频" -ForegroundColor White
        
        Write-Host "`n请在浏览器中完成这些测试步骤，完成后请按任意键继续..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        
        $results = @{}
        
        Write-Host "`n请输入测试结果:" -ForegroundColor Cyan
        $results["视频加载"] = (Read-Host "视频加载测试是否通过？(Y/N)") -eq "Y"
        $results["播放"] = (Read-Host "播放测试是否通过？(Y/N)") -eq "Y"
        $results["暂停"] = (Read-Host "暂停测试是否通过？(Y/N)") -eq "Y"
        $results["列表切换"] = (Read-Host "列表切换测试是否通过？(Y/N)") -eq "Y"
        
        $passCount = ($results.Values | Where-Object { $_ -eq $true }).Count
        $totalCount = $results.Count
        
        Write-Host "`n测试结果汇总: $passCount/$totalCount 通过" -ForegroundColor $(if ($passCount -eq $totalCount) { "Green" } else { "Yellow" })
        
        foreach ($test in $results.Keys) {
            $status = if ($results[$test]) { "✅ 通过" } else { "❌ 失败" }
            $color = if ($results[$test]) { "Green" } else { "Red" }
            Write-Host "$test 测试: $status" -ForegroundColor $color
        }
    }
    "2" {
        Write-Host "`n正在生成播放器测试报告..." -ForegroundColor Yellow
        
        # 创建报告目录
        $reportDir = "./test-report"
        if (-not (Test-Path $reportDir)) {
            New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
        }
        
        # 生成报告文件
        $reportFile = "$reportDir/video-player-test-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
        
        "视频播放器功能测试报告" | Out-File -FilePath $reportFile
        "生成时间: $(Get-Date)" | Out-File -FilePath $reportFile -Append
        "=======================================`n" | Out-File -FilePath $reportFile -Append
        
        "1. 环境信息:" | Out-File -FilePath $reportFile -Append
        "前端服务状态: $(if ($frontendRunning) { '运行中' } else { '未运行' })" | Out-File -FilePath $reportFile -Append
        "测试页面URL: $testPlayerUrl" | Out-File -FilePath $reportFile -Append
        
        # 获取浏览器信息
        try {
            $defaultBrowser = (Get-ItemProperty HKCU:\Software\Microsoft\Windows\Shell\Associations\UrlAssociations\http\UserChoice).ProgId
            "默认浏览器: $defaultBrowser" | Out-File -FilePath $reportFile -Append
        } catch {
            "默认浏览器: 未知" | Out-File -FilePath $reportFile -Append
        }
        
        "2. 视频播放器配置:" | Out-File -FilePath $reportFile -Append
        "使用模拟数据: 是" | Out-File -FilePath $reportFile -Append
        "视频源: 公共样本视频" | Out-File -FilePath $reportFile -Append
        
        Write-Host "✅ 测试报告已生成: $reportFile" -ForegroundColor Green
    }
    "0" {
        Write-Host "退出程序" -ForegroundColor Yellow
        return
    }
    default {
        Write-Host "❌ 无效的选项" -ForegroundColor Red
    }
}

Write-Host "`n测试完成！" -ForegroundColor Cyan
