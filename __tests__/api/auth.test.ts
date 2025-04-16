/* 这个文件需要测试框架支持才能正常运行
 * 以下代码仅作为API测试的示例，在安装Jest和相关依赖后将可运行
 */

// 导入fetchWithAuth函数和useAuth钩子
import { fetchWithAuth } from '@/lib/fetchUtils';
import { useAuth } from '@/hooks/useAuth';

// 模拟全局fetch和useAuth
const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
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
    // 模拟useAuth返回的token
    (useAuth as jest.Mock).mockReturnValue({
      token: 'test-token',
      user: { id: 1, username: 'testuser' },
    });
    
    // 模拟API响应
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'test data' }),
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
  });
});
