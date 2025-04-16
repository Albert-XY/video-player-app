# 视频播放器应用 - 数据库初始化和示例数据导入脚本
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "       视频播放器数据库初始化和示例数据导入       " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# 检查PostgreSQL是否安装
$pgService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
if (-not $pgService) {
    Write-Host "❌ 未检测到PostgreSQL服务，请确保已安装PostgreSQL" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 检测到PostgreSQL服务: $($pgService.DisplayName)" -ForegroundColor Green

# 自动查找PostgreSQL安装目录
function Find-PostgreSQLPath {
    # 常见安装路径
    $pgPaths = @(
        "$env:ProgramFiles\PostgreSQL",
        "${env:ProgramFiles(x86)}\PostgreSQL",
        "C:\Program Files\PostgreSQL",
        "C:\Program Files (x86)\PostgreSQL",
        "$env:LOCALAPPDATA\Programs\PostgreSQL",
        "D:\PostgreSQL",
        "D:\Program Files\PostgreSQL"
    )
    
    # 检查每个安装路径
    foreach ($basePath in $pgPaths) {
        if (Test-Path $basePath) {
            $versions = Get-ChildItem -Path $basePath -Directory | Sort-Object Name -Descending
            foreach ($version in $versions) {
                $binPath = Join-Path -Path $version.FullName -ChildPath "bin"
                if (Test-Path -Path "$binPath\psql.exe") {
                    return $binPath
                }
            }
        }
    }
    
    # 尝试使用注册表查找
    try {
        $pgRegPath = Get-ChildItem -Path HKLM:\SOFTWARE\PostgreSQL -ErrorAction SilentlyContinue
        if ($pgRegPath) {
            $pgRegPath | ForEach-Object {
                $regVersion = Split-Path -Leaf $_.Name
                $installLocation = Get-ItemProperty -Path $_.PSPath -Name "Base Directory" -ErrorAction SilentlyContinue
                if ($installLocation) {
                    $binPath = Join-Path -Path $installLocation."Base Directory" -ChildPath "bin"
                    if (Test-Path -Path "$binPath\psql.exe") {
                        return $binPath
                    }
                }
            }
        }
    } catch {
        # 注册表查找失败，继续使用其他方法
    }
    
    return $null
}

$pgPath = Find-PostgreSQLPath

if (-not $pgPath) {
    Write-Host "❌ 未能自动找到PostgreSQL路径" -ForegroundColor Yellow
    
    # 尝试在系统PATH中查找psql.exe
    $psqlInPath = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlInPath) {
        $pgPath = Split-Path -Parent $psqlInPath.Source
        Write-Host "✅ 在系统PATH中找到PostgreSQL: $pgPath" -ForegroundColor Green
    } else {
        # 如果自动查找失败，提示用户手动输入
        Write-Host "请手动设置PostgreSQL的bin目录路径:" -ForegroundColor Yellow
        Write-Host "常见位置: C:\Program Files\PostgreSQL\<版本号>\bin" -ForegroundColor Yellow
        $pgPath = Read-Host "请输入PostgreSQL bin目录的完整路径"
        
        if (-not (Test-Path -Path "$pgPath\psql.exe")) {
            Write-Host "❌ 指定路径无效，未找到psql.exe" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host "✅ 找到PostgreSQL路径: $pgPath" -ForegroundColor Green

# 设置环境变量使我们可以直接调用PostgreSQL命令
$env:Path = "$pgPath;$env:Path"

# 数据库配置
$dbName = "video_player_db"
$dbUser = "postgres"
$dbPassword = "123456"  # 从application.properties文件中获取的默认密码

# 尝试连接到PostgreSQL
Write-Host "`n[1] 测试PostgreSQL连接..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = $dbPassword
    $testConn = & "$pgPath\psql.exe" -U $dbUser -c "SELECT version();" -t
    Write-Host "✅ 成功连接到PostgreSQL: $($testConn.Trim())" -ForegroundColor Green
} catch {
    Write-Host "❌ 连接PostgreSQL失败，请检查用户名和密码" -ForegroundColor Red
    $dbUser = Read-Host "请输入PostgreSQL用户名 (默认: postgres)"
    if ([string]::IsNullOrEmpty($dbUser)) { $dbUser = "postgres" }
    
    $securePassword = Read-Host "请输入PostgreSQL密码" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $dbPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    $env:PGPASSWORD = $dbPassword
    
    try {
        $testConn = & "$pgPath\psql.exe" -U $dbUser -c "SELECT 1;" -t
        Write-Host "✅ 使用新凭据成功连接到PostgreSQL" -ForegroundColor Green
    } catch {
        Write-Host "❌ 仍然无法连接到PostgreSQL，请检查安装" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n[2] 检查数据库是否存在..." -ForegroundColor Yellow

# 运行检查数据库是否存在的命令
$dbExists = $false
try {
    $result = & "$pgPath\psql.exe" -U $dbUser -t -c "SELECT 1 FROM pg_database WHERE datname='$dbName'"
    if ($result -match "1") {
        $dbExists = $true
        Write-Host "✅ 数据库 '$dbName' 已存在" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ 检查数据库时出错: $_" -ForegroundColor Yellow
}

# 如果数据库不存在，则创建
if (-not $dbExists) {
    Write-Host "`n[3] 创建数据库 '$dbName'..." -ForegroundColor Yellow
    try {
        & "$pgPath\createdb.exe" -U $dbUser $dbName
        Write-Host "✅ 数据库 '$dbName' 创建成功" -ForegroundColor Green
    } catch {
        Write-Host "❌ 创建数据库失败: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n[3] 数据库已存在，跳过创建步骤" -ForegroundColor Yellow
}

# 提示用户确认是否导入示例数据
Write-Host "`n[4] 导入示例数据" -ForegroundColor Yellow
Write-Host "注意: 这将向数据库中添加示例用户、视频和评论等数据" -ForegroundColor Yellow
$confirm = Read-Host "是否继续导入示例数据? (Y/N)"

if ($confirm -eq "Y" -or $confirm -eq "y") {
    # 检查应用是否已启动（如果已启动，表结构可能已经创建）
    Write-Host "`n[5] 检查表结构..." -ForegroundColor Yellow
    
    $tablesExist = $false
    try {
        $result = & "$pgPath\psql.exe" -U $dbUser -d $dbName -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'"
        if ([int]$result -gt 0) {
            $tablesExist = $true
            Write-Host "✅ 数据库中已有表结构" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️ 检查表结构时出错: $_" -ForegroundColor Yellow
    }
    
    if (-not $tablesExist) {
        Write-Host "⚠️ 数据库中没有表结构，需要先启动应用创建表结构" -ForegroundColor Yellow
        Write-Host "请先运行应用以创建表结构，然后再次运行此脚本导入示例数据" -ForegroundColor Yellow
        
        $startApp = Read-Host "是否立即启动应用以创建表结构? (Y/N)"
        if ($startApp -eq "Y" -or $startApp -eq "y") {
            Write-Host "`n[6] 启动应用创建表结构..." -ForegroundColor Yellow
            
            # 检查mvnw.cmd是否存在
            $mvnwPath = Join-Path -Path $PSScriptRoot -ChildPath "backend\mvnw.cmd" 
            if (Test-Path $mvnwPath) {
                # 在后台启动Spring Boot应用
                Start-Process -FilePath "powershell" -ArgumentList "-Command cd '$PSScriptRoot'; cd backend; .\mvnw.cmd spring-boot:run" -WindowStyle Hidden
            } else {
                # 尝试使用全局maven
                Start-Process -FilePath "powershell" -ArgumentList "-Command cd '$PSScriptRoot'; cd backend; mvn spring-boot:run" -WindowStyle Hidden
            }
            
            Write-Host "应用正在启动中，请等待约30秒让表结构创建完成..." -ForegroundColor Yellow
            Start-Sleep -Seconds 30
            
            # 检查表是否已创建
            try {
                $result = & "$pgPath\psql.exe" -U $dbUser -d $dbName -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'"
                if ([int]$result -gt 0) {
                    Write-Host "✅ 表结构已成功创建" -ForegroundColor Green
                } else {
                    Write-Host "❌ 表结构创建失败，请手动启动应用后再运行此脚本" -ForegroundColor Red
                    exit 1
                }
            } catch {
                Write-Host "❌ 检查表结构时出错: $_" -ForegroundColor Red
                exit 1
            }
            
            # 停止应用
            Get-Process -Name java -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match "spring-boot" } | Stop-Process -Force
            Write-Host "✅ 已停止应用进程" -ForegroundColor Green
        } else {
            Write-Host "已取消导入操作，请先启动应用创建表结构" -ForegroundColor Yellow
            exit 0
        }
    }
    
    # 导入示例数据
    Write-Host "`n[7] 导入示例数据..." -ForegroundColor Yellow
    
    $sqlFile = Join-Path -Path $PSScriptRoot -ChildPath "database\sample_data.sql"
    if (Test-Path -Path $sqlFile) {
        try {
            # 使用psql执行SQL文件
            & "$pgPath\psql.exe" -U $dbUser -d $dbName -f $sqlFile
            Write-Host "✅ 示例数据导入成功" -ForegroundColor Green
        } catch {
            Write-Host "❌ 导入示例数据失败: $_" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ 示例数据SQL文件不存在: $sqlFile" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "已取消导入示例数据" -ForegroundColor Yellow
}

Write-Host "`n==============================================" -ForegroundColor Cyan
Write-Host "       数据库设置完成                          " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "数据库名称: $dbName" -ForegroundColor Green
Write-Host "用户名: $dbUser" -ForegroundColor Green
Write-Host "数据库已准备就绪，可以启动应用进行测试" -ForegroundColor Green
