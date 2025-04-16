# 设置Docker国内镜像源配置
Write-Host "============ 配置Docker国内镜像源 ============" -ForegroundColor Cyan

# 检查Docker配置目录是否存在
$dockerConfigPath = "$env:USERPROFILE\.docker"
if (-not (Test-Path $dockerConfigPath)) {
    New-Item -ItemType Directory -Path $dockerConfigPath -Force | Out-Null
    Write-Host "创建Docker配置目录: $dockerConfigPath" -ForegroundColor Green
}

# 检查配置文件是否存在
$configFile = "$dockerConfigPath\config.json"
if (-not (Test-Path $configFile)) {
    # 创建新的配置文件
    $configContent = @{
        "registry-mirrors" = @(
            "https://registry.docker-cn.com",
            "https://mirror.baidubce.com",
            "https://hub-mirror.c.163.com"
        )
    } | ConvertTo-Json -Depth 10
    
    $configContent | Out-File -FilePath $configFile -Encoding utf8
    Write-Host "创建Docker配置文件并设置国内镜像源" -ForegroundColor Green
} else {
    # 读取已有配置
    $config = Get-Content -Path $configFile -Raw | ConvertFrom-Json
    
    # 确保registry-mirrors属性存在
    if (-not (Get-Member -InputObject $config -Name "registry-mirrors" -MemberType Properties)) {
        Add-Member -InputObject $config -MemberType NoteProperty -Name "registry-mirrors" -Value @()
    }
    
    # 添加镜像源（如果不存在）
    $mirrors = @(
        "https://registry.docker-cn.com",
        "https://mirror.baidubce.com", 
        "https://hub-mirror.c.163.com"
    )
    
    foreach ($mirror in $mirrors) {
        if ($config."registry-mirrors" -notcontains $mirror) {
            $config."registry-mirrors" += $mirror
        }
    }
    
    # 保存更新后的配置
    $config | ConvertTo-Json -Depth 10 | Out-File -FilePath $configFile -Encoding utf8
    Write-Host "更新Docker配置文件，添加国内镜像源" -ForegroundColor Green
}

Write-Host "Docker镜像源配置完成，请重启Docker Desktop以应用更改" -ForegroundColor Yellow
Write-Host "============ 配置完成 ============" -ForegroundColor Cyan
