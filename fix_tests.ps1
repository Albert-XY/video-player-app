# 修复测试环境脚本
Write-Host "============ 开始修复测试环境 ============" -ForegroundColor Cyan

# 清理node_modules文件夹中的冲突依赖
Write-Host "清理测试相关的npm缓存..." -ForegroundColor Yellow
npm cache clean --force

# 创建.npmrc文件以解决冲突
@'
legacy-peer-deps=true
force=true
'@ | Out-File -FilePath ".npmrc" -Encoding utf8

# 安装必要的测试依赖
Write-Host "安装必要的测试依赖..." -ForegroundColor Yellow
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @types/jest babel-jest

# 重新创建Jest配置
Write-Host "更新Jest配置..." -ForegroundColor Yellow
@'
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
'@ | Out-File -FilePath "jest.simple.config.js" -Encoding utf8

# 创建简化版运行测试脚本
@'
# 简化前端测试脚本
Write-Host "============ 运行前端简化测试 ============" -ForegroundColor Cyan

# 设置环境变量
$env:NODE_OPTIONS = "--no-warnings"

# 运行前端测试
Write-Host "运行VideoPlayer组件测试..." -ForegroundColor Yellow
npx jest --config=jest.simple.config.js __tests__/components/VideoPlayer.test.tsx

# 测试结果
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 前端测试通过!" -ForegroundColor Green
} else {
    Write-Host "❌ 前端测试失败，请查看详细信息" -ForegroundColor Red
}

Write-Host "============ 前端测试完成 ============" -ForegroundColor Cyan
'@ | Out-File -FilePath "run_simple_test.ps1" -Encoding utf8

Write-Host "✅ 测试环境修复完成！" -ForegroundColor Green
Write-Host "请运行 .\run_simple_test.ps1 来测试VideoPlayer组件" -ForegroundColor Green
Write-Host "============ 修复完成 ============" -ForegroundColor Cyan
