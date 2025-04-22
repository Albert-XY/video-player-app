/**
 * 网络请求工具函数
 * 封装带有认证Token的网络请求，用于前端API调用
 */

/**
 * 封装带有认证Token的fetch请求
 * @param url 请求URL
 * @param options 请求选项
 * @returns Promise<Response>
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  // 从localStorage获取认证Token
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  // 合并请求头
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  
  // 发送请求
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // 处理401未授权情况
  if (response.status === 401) {
    // 清除失效的token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      // 可选：重定向到登录页
      // window.location.href = '/login';
    }
  }
  
  return response;
};

/**
 * 处理网络请求错误
 * @param response 响应对象
 * @returns 处理后的响应数据
 */
export const handleFetchError = async (response: Response) => {
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json();
      throw new Error(data.error || '请求失败');
    } else {
      const text = await response.text();
      throw new Error('请求失败: ' + (text || response.statusText));
    }
  }
  return response.json();
};
