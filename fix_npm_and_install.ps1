# 修复NPM安装问题并安装Vitest依赖
Write-Host "============ 开始修复NPM并安装Vitest依赖 ============" -ForegroundColor Cyan

# 清理NPM缓存
Write-Host "清理NPM缓存..." -ForegroundColor Yellow
npm cache clean --force

# 修复NPM
Write-Host "修复NPM..." -ForegroundColor Yellow
npm cache verify

# 直接安装依赖（不使用我们之前的脚本，逐个安装减少错误可能）
Write-Host "安装Vitest核心依赖..." -ForegroundColor Yellow
npm install -D vitest --legacy-peer-deps
npm install -D @vitest/ui --legacy-peer-deps
npm install -D @vitest/coverage-v8 --legacy-peer-deps

Write-Host "安装React测试依赖..." -ForegroundColor Yellow
npm install -D @testing-library/react --legacy-peer-deps
npm install -D @testing-library/jest-dom --legacy-peer-deps
npm install -D @testing-library/user-event --legacy-peer-deps

Write-Host "安装Vite相关依赖..." -ForegroundColor Yellow  
npm install -D @vitejs/plugin-react --legacy-peer-deps
npm install -D vite --legacy-peer-deps

Write-Host "安装类型定义..." -ForegroundColor Yellow
npm install -D @types/testing-library__jest-dom --legacy-peer-deps
npm install -D jsdom @types/jsdom --legacy-peer-deps

Write-Host "✅ 依赖安装完成！" -ForegroundColor Green
Write-Host "============ 安装完成 ============" -ForegroundColor Cyan
