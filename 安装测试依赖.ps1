# 视频播放器应用 - 测试依赖安装脚本
Write-Host "============ 开始安装测试依赖 ============" -ForegroundColor Cyan

# 创建临时目录安装依赖
$tempDir = ".\temp_node_modules"
if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
}

# 切换到临时目录
Push-Location $tempDir

# 创建临时package.json
@"
{
  "name": "test-deps-installer",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "jsdom": "^22.1.0"
  }
}
"@ | Out-File -FilePath "package.json" -Encoding utf8

# 设置npm源为淘宝镜像
Write-Host "🔧 设置npm源为淘宝镜像..." -ForegroundColor Yellow
npm config set registry https://registry.npmmirror.com

# 安装依赖到临时目录
Write-Host "📦 安装测试依赖..." -ForegroundColor Yellow
npm install --no-fund --no-audit

# 将关键依赖复制到项目node_modules
Write-Host "📋 复制依赖到项目..." -ForegroundColor Yellow
Pop-Location

# 创建项目node_modules目录（如果不存在）
if (-not (Test-Path ".\node_modules")) {
    New-Item -ItemType Directory -Path ".\node_modules" -Force | Out-Null
}

# 复制关键依赖
$requiredPackages = @(
    "vite",
    "vitest",
    "@vitejs",
    "@testing-library",
    "jsdom"
)

foreach ($package in $requiredPackages) {
    # 检查源目录是否存在
    $sourceDir = ".\temp_node_modules\node_modules\$package"
    if (Test-Path $sourceDir) {
        # 检查目标目录是否已存在，若存在则删除
        $targetDir = ".\node_modules\$package"
        if (Test-Path $targetDir) {
            Remove-Item -Path $targetDir -Recurse -Force
        }
        
        # 创建父目录（若需要）
        $parentDir = Split-Path $targetDir -Parent
        if (-not (Test-Path $parentDir)) {
            New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
        }
        
        # 复制目录
        Copy-Item -Path $sourceDir -Destination $parentDir -Recurse -Force
        Write-Host "  - 已复制 $package" -ForegroundColor Green
    } else {
        Write-Host "  - 未找到 $package" -ForegroundColor Yellow
    }
}

# 清理临时目录
Write-Host "🧹 清理临时文件..." -ForegroundColor Yellow
Remove-Item -Path $tempDir -Recurse -Force

# 创建简单的Vitest配置文件
Write-Host "📝 创建简化的Vitest配置..." -ForegroundColor Yellow
@"
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}']
  }
});
"@ | Out-File -FilePath ".\vitest.simple.config.js" -Encoding utf8

# 创建简单的测试运行脚本
@"
# 运行简化版测试
node ./node_modules/vitest/vitest.mjs --config=vitest.simple.config.js
"@ | Out-File -FilePath ".\运行简化测试.ps1" -Encoding utf8

Write-Host "✅ 安装完成！现在你可以运行 .\运行简化测试.ps1 来执行测试" -ForegroundColor Green
Write-Host "============ 安装完成 ============" -ForegroundColor Cyan
