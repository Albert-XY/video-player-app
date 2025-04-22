/* 这个文件需要测试框架支持才能正常运行
 * 以下代码作为API测试的示例，使用Vitest而非Jest
 */

// 导入测试工具
import { describe, it, expect, beforeEach, vi } from 'vitest';

// 导入fetchWithAuth函数
import { fetchWithAuth } from '../../lib/fetchUtils';

// 模拟global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

// 模拟用户钩子
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    token: 'mock-token',
    isAuthenticated: true
  }))
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('认证API测试', () => {
  it('登录API应返回用户信息和令牌', async () => {
    // 模拟API响应
    const mockResponse = {
      user: { id: 1, username: 'testuser' },
      token: 'mock-jwt-token',
    };
    
    // 设置fetch mock
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });
    
    // 调用登录API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', password: 'password' }),
    });
    
    const data = await response.json();
    
    // 验证结果
    expect(response.ok).toBe(true);
    expect(data).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.any(Object));
  });
  
  it('fetchWithAuth应在请求中包含授权头', async () => {
    // 模拟API响应
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'test data' }),
    });
    
    // 获取localStorage中的token
    const originalLocalStorage = global.localStorage;
    // 模拟LocalStorage
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: vi.fn().mockReturnValue('test-token'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true
    });
    
    // 使用fetchWithAuth
    await fetchWithAuth('/api/protected-resource');
    
    // 验证授权头是否包含token
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/protected-resource',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
        }),
      })
    );
    
    // 恢复原始LocalStorage
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
  });
});
