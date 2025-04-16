# 全面修复测试环境脚本
Write-Host "============ 开始全面修复测试环境 ============" -ForegroundColor Cyan

# 保存当前目录
$originalDir = Get-Location

try {
    # 首先卸载可能导致冲突的依赖
    Write-Host "正在清理冲突的测试依赖..." -ForegroundColor Yellow
    npm uninstall jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom --force
    
    # 清理npm缓存
    Write-Host "清理npm缓存..." -ForegroundColor Yellow
    npm cache clean --force
    
    # 创建临时的.npmrc文件以解决依赖冲突问题
    Write-Host "配置npm安装选项..." -ForegroundColor Yellow
    @'
legacy-peer-deps=true
force=true
'@ | Out-File -FilePath ".npmrc" -Encoding utf8

    # 安装正确版本的测试依赖
    Write-Host "安装核心测试依赖..." -ForegroundColor Yellow
    npm install --save-dev jest@29.7.0 jest-environment-jsdom@29.7.0 --legacy-peer-deps
    
    Write-Host "安装React测试库..." -ForegroundColor Yellow
    npm install --save-dev @testing-library/react@14.1.2 @testing-library/jest-dom@6.1.5 @testing-library/user-event@14.5.1 --legacy-peer-deps
    
    Write-Host "安装TypeScript支持依赖..." -ForegroundColor Yellow
    npm install --save-dev @types/jest@29.5.11 ts-jest@29.1.1 identity-obj-proxy --legacy-peer-deps
    
    Write-Host "安装Babel依赖..." -ForegroundColor Yellow
    npm install --save-dev babel-jest@29.7.0 @babel/preset-env @babel/preset-react @babel/preset-typescript --legacy-peer-deps

    # 创建全新的Jest配置文件
    Write-Host "创建优化的Jest配置文件..." -ForegroundColor Yellow
    @'
module.exports = {
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js"
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }]
  },
  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$"
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"]
};
'@ | Out-File -FilePath "jest.modern.config.js" -Encoding utf8

    # 创建文件模拟
    Write-Host "创建模拟文件..." -ForegroundColor Yellow
    if (-not (Test-Path "__mocks__")) {
        New-Item -Path "__mocks__" -ItemType Directory | Out-Null
    }
    
    @'
module.exports = "test-file-stub";
'@ | Out-File -FilePath "__mocks__/fileMock.js" -Encoding utf8

    # 创建Babel配置
    Write-Host "创建Babel配置..." -ForegroundColor Yellow
    @'
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-typescript",
    ["@babel/preset-react", { runtime: "automatic" }]
  ]
};
'@ | Out-File -FilePath "babel.config.js" -Encoding utf8

    # 创建一个简单的运行测试脚本
    Write-Host "创建新的测试运行脚本..." -ForegroundColor Yellow
    @'
# 简化的前端测试脚本
Write-Host "============ 运行前端组件测试 ============" -ForegroundColor Cyan

# 运行组件测试
Write-Host "运行VideoPlayer组件测试..." -ForegroundColor Yellow
$env:NODE_OPTIONS="--no-warnings"
npx jest --config=jest.modern.config.js __tests__/components/VideoPlayer.test.tsx --verbose

# 检查测试结果
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ VideoPlayer测试通过!" -ForegroundColor Green
} else {
    Write-Host "❌ VideoPlayer测试失败，查看错误信息" -ForegroundColor Red
}

Write-Host "============ 测试完成 ============" -ForegroundColor Cyan
'@ | Out-File -FilePath "run_component_test.ps1" -Encoding utf8

    Write-Host "✅ 测试环境修复完成！" -ForegroundColor Green
    Write-Host "请运行 .\run_component_test.ps1 执行组件测试" -ForegroundColor Green

} catch {
    Write-Host "❌ 修复过程中出错: $_" -ForegroundColor Red
} finally {
    # 恢复原始目录
    Set-Location $originalDir
}

Write-Host "============ 修复过程完成 ============" -ForegroundColor Cyan
