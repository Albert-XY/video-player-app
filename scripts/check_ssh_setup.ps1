# 检查SSH密钥设置
Write-Host "==== 检查SSH密钥设置 ====" -ForegroundColor Green

# 检查SSH客户端是否安装
$sshCommand = Get-Command ssh -ErrorAction SilentlyContinue
if ($null -eq $sshCommand) {
    Write-Host "错误：SSH客户端未安装" -ForegroundColor Red
    Write-Host "请安装OpenSSH客户端后重试" -ForegroundColor Yellow
    exit 1
}

# 检查SSH密钥是否存在
$sshDir = "$env:USERPROFILE\.ssh"
if (-not (Test-Path $sshDir)) {
    Write-Host "SSH目录不存在: $sshDir" -ForegroundColor Yellow
    Write-Host "正在创建SSH目录..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
}

$idRsa = "$sshDir\id_rsa"
$idRsaPub = "$sshDir\id_rsa.pub"

if (-not (Test-Path $idRsa) -or -not (Test-Path $idRsaPub)) {
    Write-Host "未找到SSH密钥对" -ForegroundColor Yellow
    Write-Host "您需要生成一个SSH密钥对，方法如下：" -ForegroundColor Yellow
    Write-Host "1. 运行命令: ssh-keygen -t rsa -b 4096 -C 'your_email@example.com'" -ForegroundColor Cyan
    Write-Host "2. 将公钥添加到您的远程服务器中：" -ForegroundColor Cyan
    Write-Host "   a. 复制公钥内容: Get-Content $idRsaPub | clip" -ForegroundColor Cyan
    Write-Host "   b. 将公钥添加到远程服务器的 ~/.ssh/authorized_keys 文件中" -ForegroundColor Cyan
} else {
    Write-Host "找到SSH密钥对" -ForegroundColor Green
    Write-Host "公钥内容:" -ForegroundColor Yellow
    Get-Content $idRsaPub
    Write-Host "`n请确保此公钥已添加到远程服务器的authorized_keys文件中" -ForegroundColor Cyan
}

# 检查SSH配置文件
$sshConfig = "$sshDir\config"
if (-not (Test-Path $sshConfig)) {
    Write-Host "SSH配置文件不存在，建议创建一个以简化连接" -ForegroundColor Yellow
    Write-Host "示例配置:" -ForegroundColor Cyan
    Write-Host "Host your-server-alias" -ForegroundColor Cyan
    Write-Host "    HostName your-server-ip" -ForegroundColor Cyan
    Write-Host "    User your-username" -ForegroundColor Cyan
    Write-Host "    IdentityFile ~/.ssh/id_rsa" -ForegroundColor Cyan
} else {
    Write-Host "找到SSH配置文件" -ForegroundColor Green
}

# 提供测试连接的命令
Write-Host "`n要测试SSH连接，请运行:" -ForegroundColor Green
Write-Host "ssh -v your-username@your-server-ip" -ForegroundColor Cyan
Write-Host "(-v参数会显示详细的连接信息)" -ForegroundColor Cyan
