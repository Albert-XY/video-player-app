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

describe('认证API测试', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('登录API应返回用户信息和令牌', async () => {
    const mockResponse = {
      user: { id: 1, username: 'testuser' },
      token: 'mock-jwt-token',
    };

    // 用 vi.stubGlobal 保证 fetch mock 全局生效
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      })
    ));

    const response = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', password: 'password' }),
    });

    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data).toEqual(mockResponse);
  });

  it('fetchWithAuth应在请求中包含授权头', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'test data' }),
      })
    ));

    await fetchWithAuth('/api/protected-resource');

    // 断言 fetch 被调用参数
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/protected-resource',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
        }),
      })
    );
  });
});

  it('登录API应返回用户信息和令牌', async () => {
    const mockResponse = {
      user: { id: 1, username: 'testuser' },
      token: 'mock-jwt-token',
    };
    // mock fetch 返回 Response-like 对象
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

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
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'test data' }),
    });

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
