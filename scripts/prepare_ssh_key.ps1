# 准备用于GitHub Actions的SSH密钥脚本
# 该脚本帮助格式化SSH私钥，确保其符合GitHub Actions的要求

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

Write-ColorOutput Green "===== SSH密钥准备工具 ====="
Write-Output "此工具将帮助准备适用于GitHub Actions的SSH私钥格式"
Write-Output ""

# 获取SSH私钥路径
$sshKeyPath = Read-Host "请输入SSH私钥文件路径 (例如: $env:USERPROFILE\.ssh\id_rsa)"

# 检查私钥是否存在
if (-not (Test-Path $sshKeyPath)) {
    Write-ColorOutput Red "错误: 找不到SSH私钥文件: $sshKeyPath"
    exit 1
}

# 读取私钥内容
$originalKey = Get-Content -Path $sshKeyPath -Raw

# 确保私钥正确格式化
$cleanKey = $originalKey -replace "`r`n", "`n"  # 确保使用LF而不是CRLF
$cleanKey = $cleanKey.Trim()  # 移除前后空白字符

# 检查私钥格式
if (-not ($cleanKey -match "-----BEGIN .* PRIVATE KEY-----")) {
    Write-ColorOutput Red "错误: 文件不是有效的SSH私钥格式"
    exit 1
}

if (-not ($cleanKey -match "-----END .* PRIVATE KEY-----")) {
    Write-ColorOutput Red "错误: 私钥不完整，缺少结束标记"
    exit 1
}

# 输出格式化的私钥
Write-ColorOutput Green "`n格式化后的SSH私钥 (用于GitHub Secrets):"
Write-Output $cleanKey

# 生成用于测试的开放格式密钥
$openSshKeyPath = "$sshKeyPath.github"
$cleanKey | Out-File -FilePath $openSshKeyPath -Encoding utf8 -NoNewline
Write-ColorOutput Green "`n已保存格式化的私钥到: $openSshKeyPath"

# 指导如何在GitHub中设置
Write-Output "`n===== GitHub Actions设置步骤 ====="
Write-ColorOutput Yellow "1. 复制上面输出的完整私钥内容 (包括BEGIN和END行)"
Write-ColorOutput Yellow "2. 在GitHub仓库中，转到 Settings > Secrets > Actions"
Write-ColorOutput Yellow "3. 添加新的仓库密钥，名称为 'SERVER_SSH_KEY'"
Write-ColorOutput Yellow "4. 将格式化后的私钥粘贴到值字段中"
Write-ColorOutput Yellow "5. 确保没有添加额外的空行或空格"

# 密钥格式提示
Write-Output "`n===== 密钥格式检查 ====="
Write-Output "私钥应该以这种格式开始和结束:"
Write-ColorOutput Cyan "-----BEGIN OPENSSH PRIVATE KEY-----"
Write-Output "[密钥内容...]"
Write-ColorOutput Cyan "-----END OPENSSH PRIVATE KEY-----"

Write-Output "`n或者对于RSA密钥:"
Write-ColorOutput Cyan "-----BEGIN RSA PRIVATE KEY-----"
Write-Output "[密钥内容...]"
Write-ColorOutput Cyan "-----END RSA PRIVATE KEY-----"

# 服务器端配置
Write-Output "`n===== 服务器端配置 ====="
Write-ColorOutput Yellow "确保服务器上的 ~/.ssh/authorized_keys 文件包含相应的公钥"
Write-ColorOutput Yellow "检查服务器 /etc/ssh/sshd_config 文件中以下设置:"
Write-ColorOutput Cyan "PubkeyAuthentication yes"
Write-ColorOutput Cyan "AuthorizedKeysFile .ssh/authorized_keys"

Write-ColorOutput Green "`n===== 完成 ====="
