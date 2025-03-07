# SSH连接测试脚本

# 设置颜色函数
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# 显示标题
Write-ColorOutput Green "===== SSH连接测试工具 ====="

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
    Write-ColorOutput Red "错误: SSH私钥文件不存在: $sshKeyPath"
    Write-ColorOutput Yellow "请生成SSH密钥对或提供正确的路径"
    exit 1
}

# 测试连接 - 使用详细模式
Write-Output "`n===== 测试SSH连接（详细模式） ====="
Write-ColorOutput Yellow "执行命令: ssh -v -i `"$sshKeyPath`" $serverUser@$serverHost echo '连接成功'"
Write-ColorOutput Yellow "注意: 这将显示详细的SSH连接过程"
Write-Output ""

$connectionTest = ssh -v -i "$sshKeyPath" "$serverUser@$serverHost" "echo '连接成功'" 2>&1
$connectionSuccess = $?

# 显示连接结果
Write-Output $connectionTest

# 检查连接结果
if ($connectionSuccess) {
    Write-ColorOutput Green "`n✅ SSH连接成功！"
    
    # 检查部署目录
    Write-Output "`n===== 检查部署目录 ====="
    Write-ColorOutput Yellow "检查 /opt/video-player-app 目录是否存在..."
    
    $dirExists = ssh -i "$sshKeyPath" "$serverUser@$serverHost" "[ -d /opt/video-player-app ] && echo 'exists' || echo 'not exists'"
    
    if ($dirExists -eq "exists") {
        Write-ColorOutput Green "✅ 部署目录存在"
        
        # 检查docker和docker-compose
        Write-Output "`n===== 检查Docker环境 ====="
        $dockerVersion = ssh -i "$sshKeyPath" "$serverUser@$serverHost" "docker --version && docker-compose --version" 2>&1
        Write-Output $dockerVersion
        
        # 检查git访问权限
        Write-Output "`n===== 检查Git仓库访问 ====="
        $gitRemote = ssh -i "$sshKeyPath" "$serverUser@$serverHost" "cd /opt/video-player-app && git remote -v" 2>&1
        Write-Output $gitRemote
    } else {
        Write-ColorOutput Red "❌ 部署目录不存在，需要创建"
    }
} else {
    Write-ColorOutput Red "`n❌ SSH连接失败！请检查以下事项："
    Write-ColorOutput Yellow "1. 服务器地址或用户名是否正确"
    Write-ColorOutput Yellow "2. SSH私钥是否正确"
    Write-ColorOutput Yellow "3. 服务器上是否已添加对应的公钥"
    Write-ColorOutput Yellow "4. 服务器SSH服务是否正常运行"
    Write-ColorOutput Yellow "5. 防火墙是否允许SSH连接"
}

Write-ColorOutput Green "`n===== 测试完成 ====="
