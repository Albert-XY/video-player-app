# 测试环境设置脚本
Write-Host "============ 设置测试环境 ============" -ForegroundColor Cyan

# 安装测试相关依赖
Write-Host "正在安装测试相关依赖..." -ForegroundColor Yellow
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest @types/testing-library__jest-dom --legacy-peer-deps --force

# 安装类型声明文件
Write-Host "安装TypeScript类型声明文件..." -ForegroundColor Yellow
npm install --save-dev typescript @types/node @types/react @types/react-dom --legacy-peer-deps --force

# 配置Jest
Write-Host "正在确保Jest配置正确..." -ForegroundColor Yellow
if (-Not (Test-Path -Path "jest.config.js")) {
    Write-Host "创建Jest配置文件..." -ForegroundColor Yellow
    @'
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ]
};
'@ | Out-File -FilePath "jest.config.js" -Encoding utf8
}

# 创建Jest setup文件
if (-Not (Test-Path -Path "jest.setup.js")) {
    Write-Host "创建Jest setup文件..." -ForegroundColor Yellow
    @'
// 导入Jest DOM扩展
import '@testing-library/jest-dom';

// 设置全局配置
global.process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';

// 模拟媒体元素
Object.defineProperty(window, 'HTMLMediaElement', {
  writable: true,
  value: class MockHTMLMediaElement {
    constructor() {
      this.pause = jest.fn();
      this.play = jest.fn().mockReturnValue(Promise.resolve());
      this.load = jest.fn();
      this.addEventListener = jest.fn();
      this.removeEventListener = jest.fn();
    }
  },
});

// 解决测试中的错误
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
}));
'@ | Out-File -FilePath "jest.setup.js" -Encoding utf8
}

Write-Host "✅ 测试环境设置完成！" -ForegroundColor Green
Write-Host "============ 设置完成 ============" -ForegroundColor Cyan
