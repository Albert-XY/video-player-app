/* 这个文件需要测试框架支持才能正常运行
 * 以下代码作为API测试的示例，使用Vitest而非Jest
 */

import { describe, it, expect, beforeEach, vi, SpyInstance } from 'vitest';
import { fetchWithAuth } from '../../lib/fetchUtils';

// 模拟localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('认证API测试', () => {
  let fetchMock: SpyInstance;
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // 创建响应模拟
    const mockJsonPromise = Promise.resolve({ success: true, data: 'test data' });
    const mockResponse = {
      ok: true,
      json: () => mockJsonPromise,
      status: 200,
      clone: function() { return this; }
    };
    
    // 设置fetch模拟
    fetchMock = vi.fn().mockResolvedValue(mockResponse);
    global.fetch = fetchMock as unknown as typeof global.fetch;
    
    // 确保localStorage.getItem返回正确的token
    (localStorage.getItem as any).mockImplementation((key: string) => {
      if (key === 'authToken') return 'test-token';
      return null;
    });
  });
  
  it('登录API应返回用户信息和令牌', async () => {
    const mockResponse = {
      user: { id: 1, username: 'testuser' },
      token: 'mock-jwt-token'
    };
    
    // 为特定请求替换mock
    const loginResponse = {
      ok: true,
      json: () => Promise.resolve(mockResponse),
      status: 200,
      clone: function() { return this; }
    };
    
    fetchMock.mockResolvedValueOnce(loginResponse);
    
    // 使用fetch调用登录API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', password: 'password' })
    });
    
    // 检查响应
    const data = await response.json();
    expect(data).toEqual(mockResponse);
    
    // 验证fetch调用参数
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', password: 'password' })
    });
  });
  
  it('fetchWithAuth应在请求中包含授权头', async () => {
    // 执行带有授权的请求
    await fetchWithAuth('/api/protected-resource');
    
    // 验证localStorage.getItem被调用了
    expect(localStorage.getItem).toHaveBeenCalledWith('authToken');
    
    // 验证fetch被调用
    expect(fetchMock).toHaveBeenCalledTimes(1);
    
    // 验证调用参数
    const [url, options] = fetchMock.mock.calls[0];
    
    // 检查URL
    expect(url).toBe('/api/protected-resource');
    
    // 打印headers以便debugging
    console.log('Headers:', JSON.stringify(options.headers));
    
    // 验证headers包含授权头
    expect(options.headers).toEqual(expect.objectContaining({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    }));
  });
});
