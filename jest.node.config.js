// 极简Jest配置，使用node环境而不是jsdom
module.exports = {
  testEnvironment: 'node',
  transform: {},
  testMatch: [
    '**/__tests__/basic.test.js'
  ]
};
