# 视频播放器应用 - 本地测试环境启动脚本
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "       视频播放器应用 - 本地测试环境启动       " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# 首先停止可能正在运行的服务
function Stop-ProcessByPort {
    param(
        [int]$Port
    )
    
    $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
               Select-Object -ExpandProperty OwningProcess | 
               ForEach-Object { Get-Process -Id $_ }
    
    if ($process) {
        Write-Host "正在停止占用端口 $Port 的进程: $($process.Name) (ID: $($process.Id))" -ForegroundColor Yellow
        Stop-Process -Id $process.Id -Force
        Start-Sleep -Seconds 1
    }
}

# 停止前端和后端端口上的进程
Write-Host "`n[1] 停止已有服务..." -ForegroundColor Yellow
try {
    Stop-ProcessByPort -Port 3000  # 前端端口
    Stop-ProcessByPort -Port 8080  # 后端端口
    Write-Host "✅ 端口已清理" -ForegroundColor Green
} catch {
    Write-Host "⚠️ 端口清理过程中出现问题，可能会影响后续操作" -ForegroundColor Yellow
}

# 检测后端类型 (Java 或 Python)
Write-Host "`n[2] 检测后端服务类型..." -ForegroundColor Yellow
$backendType = ""
$pythonBackendPath = ".\python"
$javaBackendPath = ".\backend"

if (Test-Path -Path (Join-Path -Path $javaBackendPath -ChildPath "pom.xml")) {
    $backendType = "java"
    Write-Host "✅ 检测到Java后端 (Spring Boot)" -ForegroundColor Green
} elseif ((Test-Path -Path (Join-Path -Path $pythonBackendPath -ChildPath "app.py")) -or 
          (Test-Path -Path (Join-Path -Path $pythonBackendPath -ChildPath "main.py")) -or 
          (Test-Path -Path (Join-Path -Path $pythonBackendPath -ChildPath "server.py"))) {
    $backendType = "python"
    Write-Host "✅ 检测到Python后端" -ForegroundColor Green
} else {
    Write-Host "⚠️ 无法确定后端类型，将尝试同时检查Java和Python" -ForegroundColor Yellow
    $backendType = "unknown"
}

# 设置环境变量
$env:NEXT_PUBLIC_API_URL = "http://localhost:8080"

# 启动后端服务
Write-Host "`n[3] 启动后端服务..." -ForegroundColor Yellow

# 创建后端启动作业
$backendJob = $null

if ($backendType -eq "java" -or $backendType -eq "unknown") {
    if (Test-Path -Path (Join-Path -Path $javaBackendPath -ChildPath "pom.xml")) {
        try {
            $backendJob = Start-Job -ScriptBlock {
                Set-Location $using:javaBackendPath
                # 使用mvnw如果存在，否则使用全局mvn
                if (Test-Path -Path ".\mvnw.cmd") {
                    .\mvnw.cmd spring-boot:run
                } else {
                    mvn spring-boot:run
                }
            }
            Write-Host "✅ Java后端服务正在启动 (端口8080)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Java后端启动失败: $_" -ForegroundColor Red
        }
    }
} 

if (($backendType -eq "python" -or $backendType -eq "unknown") -and -not $backendJob) {
    # 查找Python后端入口文件
    $pythonFiles = @("app.py", "main.py", "server.py", "run.py", "api.py")
    $pythonEntryFile = $null
    
    foreach ($file in $pythonFiles) {
        if (Test-Path -Path (Join-Path -Path $pythonBackendPath -ChildPath $file)) {
            $pythonEntryFile = (Join-Path -Path $pythonBackendPath -ChildPath $file)
            break
        }
    }
    
    if ($pythonEntryFile) {
        try {
            $backendJob = Start-Job -ScriptBlock {
                Set-Location (Split-Path $using:pythonEntryFile -Parent)
                $fileName = Split-Path $using:pythonEntryFile -Leaf
                python $fileName
            }
            Write-Host "✅ Python后端服务正在启动 (端口8080)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Python后端启动失败: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ 未找到Python入口文件" -ForegroundColor Red
    }
}

# 等待后端服务启动
Write-Host "`n[4] 等待后端服务就绪..." -ForegroundColor Yellow
$backendReady = $false
$maxRetries = 10
$retryCount = 0

while (-not $backendReady -and $retryCount -lt $maxRetries) {
    $retryCount++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "✅ 后端服务已就绪" -ForegroundColor Green
        }
    } catch {
        Write-Host "  等待后端服务启动 (尝试 $retryCount/$maxRetries)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if (-not $backendReady) {
    Write-Host "⚠️ 无法确认后端服务已就绪，但将继续启动前端" -ForegroundColor Yellow
}

# 启动前端服务
Write-Host "`n[5] 启动Next.js前端服务..." -ForegroundColor Yellow
try {
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm run dev
    }
    Write-Host "✅ Next.js前端服务正在启动 (端口3000)" -ForegroundColor Green
} catch {
    Write-Host "❌ 前端服务启动失败: $_" -ForegroundColor Red
}

# 等待前端服务启动
Write-Host "`n[6] 等待前端服务就绪..." -ForegroundColor Yellow
$frontendReady = $false
$retryCount = 0

while (-not $frontendReady -and $retryCount -lt $maxRetries) {
    $retryCount++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            Write-Host "✅ 前端服务已就绪" -ForegroundColor Green
        }
    } catch {
        Write-Host "  等待前端服务启动 (尝试 $retryCount/$maxRetries)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if (-not $frontendReady) {
    Write-Host "⚠️ 无法确认前端服务已就绪，请手动检查" -ForegroundColor Yellow
}

# 显示服务状态和访问信息
Write-Host "`n==============================================" -ForegroundColor Cyan
Write-Host "       本地测试环境启动完成                   " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "✓ 前端地址: http://localhost:3000" -ForegroundColor Green
Write-Host "✓ 后端API地址: http://localhost:8080" -ForegroundColor Green
Write-Host "`n按 Ctrl+C 停止所有服务" -ForegroundColor Yellow

# 等待用户按键退出
try {
    while ($true) {
        # 显示后端和前端日志
        $backendOutput = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
        if ($backendOutput) {
            Write-Host "[后端] $backendOutput" -ForegroundColor DarkGray
        }
        
        $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
        if ($frontendOutput) {
            Write-Host "[前端] $frontendOutput" -ForegroundColor DarkCyan
        }
        
        # 检查作业状态
        if ($backendJob.State -eq "Failed" -or $backendJob.State -eq "Completed") {
            Write-Host "⚠️ 后端服务已停止，按 Enter 键重启或 Ctrl+C 退出" -ForegroundColor Red
            if ([console]::KeyAvailable) {
                $key = [console]::ReadKey($true)
                if ($key.Key -eq "Enter") {
                    # 重启后端
                    Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
                    Remove-Job -Job $backendJob -ErrorAction SilentlyContinue
                    
                    # 根据之前检测到的后端类型重启
                    if ($backendType -eq "java") {
                        $backendJob = Start-Job -ScriptBlock {
                            Set-Location $using:javaBackendPath
                            if (Test-Path -Path ".\mvnw.cmd") {
                                .\mvnw.cmd spring-boot:run
                            } else {
                                mvn spring-boot:run
                            }
                        }
                    } elseif ($backendType -eq "python" -and $pythonEntryFile) {
                        $backendJob = Start-Job -ScriptBlock {
                            Set-Location (Split-Path $using:pythonEntryFile -Parent)
                            $fileName = Split-Path $using:pythonEntryFile -Leaf
                            python $fileName
                        }
                    }
                    Write-Host "✅ 后端服务正在重启..." -ForegroundColor Green
                }
            }
        }
        
        if ($frontendJob.State -eq "Failed" -or $frontendJob.State -eq "Completed") {
            Write-Host "⚠️ 前端服务已停止，按 Enter 键重启或 Ctrl+C 退出" -ForegroundColor Red
            if ([console]::KeyAvailable) {
                $key = [console]::ReadKey($true)
                if ($key.Key -eq "Enter") {
                    # 重启前端
                    Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
                    Remove-Job -Job $frontendJob -ErrorAction SilentlyContinue
                    
                    $frontendJob = Start-Job -ScriptBlock {
                        Set-Location $using:PWD
                        npm run dev
                    }
                    Write-Host "✅ 前端服务正在重启..." -ForegroundColor Green
                }
            }
        }
        
        Start-Sleep -Seconds 1
    }
} finally {
    # 清理作业
    Write-Host "`n正在停止所有服务..." -ForegroundColor Yellow
    
    if ($backendJob) {
        Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job -Job $backendJob -Force -ErrorAction SilentlyContinue
    }
    
    if ($frontendJob) {
        Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
        Remove-Job -Job $frontendJob -Force -ErrorAction SilentlyContinue
    }
    
    # 再次停止可能的残留进程
    Stop-ProcessByPort -Port 3000
    Stop-ProcessByPort -Port 8080
    
    Write-Host "✅ 所有服务已停止" -ForegroundColor Green
}
