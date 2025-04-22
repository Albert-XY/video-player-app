/* 这个文件需要测试框架支持才能正常运行
 * 以下代码作为API测试的示例，使用Vitest而非Jest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchWithAuth } from '../../lib/fetchUtils';

// mock localStorage 全局设置
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: vi.fn().mockReturnValue('test-token'),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
  writable: true
});

// 创建一个全局fetch模拟
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('认证API测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('登录API应返回用户信息和令牌', async () => {
    const mockResponse = {
      user: { id: 1, username: 'testuser' },
      token: 'mock-jwt-token',
    };
    
    // 创建一个完整的Response对象
    const responseObj = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => mockResponse,
    };
    
    // mock fetch 返回完整的 Response 对象
    mockFetch.mockResolvedValueOnce(responseObj);

    // 用 fetchWithAuth 而不是 fetch
    const response = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', password: 'password' }),
    });

    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.any(Object));
  });
  
  it('fetchWithAuth应在请求中包含授权头', async () => {
    // 创建一个完整的Response对象
    const responseObj = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ data: 'test data' }),
    };
    
    mockFetch.mockResolvedValueOnce(responseObj);

    await fetchWithAuth('/api/protected-resource');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/protected-resource',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
        }),
      })
    );
  });
});
