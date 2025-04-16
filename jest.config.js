// jest.config.js
// 简化的Jest配置，减少对外部依赖的需求
module.exports = {
  testEnvironment: 'node', // 使用node环境代替jsdom
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
