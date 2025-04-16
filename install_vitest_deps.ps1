# 安装Vitest和所有测试依赖的脚本
Write-Host "============ 开始安装Vitest测试依赖 ============" -ForegroundColor Cyan

# 安装核心Vitest依赖
Write-Host "安装Vitest核心依赖..." -ForegroundColor Yellow
npm install -D vitest @vitest/ui @vitest/coverage-v8 --legacy-peer-deps

# 安装React测试依赖
Write-Host "安装React测试依赖..." -ForegroundColor Yellow
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event --legacy-peer-deps

# 安装Vite插件和类型定义
Write-Host "安装Vite插件和类型定义..." -ForegroundColor Yellow
npm install -D @vitejs/plugin-react vite @types/testing-library__jest-dom --legacy-peer-deps

# 安装其他必要依赖
Write-Host "安装其他必要依赖..." -ForegroundColor Yellow
npm install -D jsdom @types/jsdom --legacy-peer-deps

Write-Host "✅ Vitest依赖安装完成！" -ForegroundColor Green
Write-Host "现在可以通过'npm test'或'npm run test:docker'运行测试" -ForegroundColor Green
Write-Host "============ 安装完成 ============" -ForegroundColor Cyan
