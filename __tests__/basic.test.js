// 最基础的测试文件，用于验证测试环境是否正常工作
// 这个文件不依赖任何外部模块或复杂配置

describe('基础测试环境验证', () => {
  test('简单的加法运算', () => {
    expect(1 + 1).toBe(2);
  });

  test('字符串操作', () => {
    expect('hello ' + 'world').toBe('hello world');
  });

  test('数组操作', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
  });

  test('对象操作', () => {
    const obj = { name: '视频播放器', version: '1.0' };
    expect(obj.name).toBe('视频播放器');
    expect(obj.hasOwnProperty('version')).toBe(true);
  });
});
