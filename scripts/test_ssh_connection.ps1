# 测试SSH连接脚本

# 获取SSH配置信息
Write-Host "===== SSH连接测试工具 =====" -ForegroundColor Green

# 输入服务器信息
$serverHost = Read-Host "请输入服务器主机名或IP地址"
$serverUser = Read-Host "请输入用户名"
$sshKeyPath = Read-Host "请输入SSH私钥路径 (默认: $env:USERPROFILE\.ssh\id_rsa)"

# 设置默认值
if ([string]::IsNullOrEmpty($sshKeyPath)) {
    $sshKeyPath = "$env:USERPROFILE\.ssh\id_rsa"
}

# 检查SSH私钥是否存在
if (-not (Test-Path $sshKeyPath)) {
    Write-Host "错误: SSH私钥文件不存在: $sshKeyPath" -ForegroundColor Red
    Write-Host "请生成SSH密钥对或提供正确的路径" -ForegroundColor Yellow
    exit 1
}

# 测试连接 - 使用详细模式
Write-Host "`n===== 测试SSH连接（详细模式） =====" -ForegroundColor Green
Write-Host "执行命令: ssh -v -i `"$sshKeyPath`" $serverUser@$serverHost echo '连接成功'" -ForegroundColor Yellow
Write-Host "注意: 这将显示详细的SSH连接过程" -ForegroundColor Yellow
Write-Host ""

ssh -v -i "$sshKeyPath" "$serverUser@$serverHost" "echo '连接成功'"

# 检查连接结果
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ SSH连接成功！" -ForegroundColor Green
    
    # 检查部署目录
    Write-Host "`n===== 检查部署目录 =====" -ForegroundColor Green
    Write-Host "检查 /opt/video-player-app 目录是否存在..." -ForegroundColor Yellow
    
    $dirExists = ssh -i "$sshKeyPath" "$serverUser@$serverHost" "[ -d /opt/video-player-app ] && echo 'exists' || echo 'not exists'"
    
    if ($dirExists -eq "exists") {
        Write-Host "✅ 部署目录存在" -ForegroundColor Green
        
        # 检查docker和docker-compose
        Write-Host "`n===== 检查Docker环境 =====" -ForegroundColor Green
        ssh -i "$sshKeyPath" "$serverUser@$serverHost" "docker --version && docker-compose --version"
        
        # 检查git访问权限
        Write-Host "`n===== 检查Git仓库访问 =====" -ForegroundColor Green
        ssh -i "$sshKeyPath" "$serverUser@$serverHost" "cd /opt/video-player-app && git remote -v"
    } else {
        Write-Host "❌ 部署目录不存在，需要创建" -ForegroundColor Red
    }
} else {
    Write-Host "`n❌ SSH连接失败！请检查以下事项：" -ForegroundColor Red
    Write-Host "1. 服务器地址或用户名是否正确" -ForegroundColor Yellow
    Write-Host "2. SSH私钥是否正确" -ForegroundColor Yellow
    Write-Host "3. 服务器上是否已添加对应的公钥" -ForegroundColor Yellow
    Write-Host "4. 服务器SSH服务是否正常运行" -ForegroundColor Yellow
    Write-Host "5. 防火墙是否允许SSH连接" -ForegroundColor Yellow
}

Write-Host "`n===== 测试完成 =====" -ForegroundColor Green
