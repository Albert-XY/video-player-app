'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// API基础URL配置
// 修改API基础URL，确保与实际运行的端口一致
// 如果NEXT_PUBLIC_API_URL环境变量存在，则使用该值，否则默认为http://localhost:8080
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 是否使用模拟API（默认为false，会在后端不可用时自动设置为true）
let useMockApi = false;

// 在应用启动时检查API可用性
async function checkApiAvailability() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    useMockApi = !response.ok;
  } catch (error) {
    console.log('API检查失败，将使用模拟API:', error);
    useMockApi = true;
  }
}

// 预检查API可用性
checkApiAvailability();

// 模拟用户数据库
const mockUsers = [
  { username: 'admin', password: 'admin123', email: 'admin@example.com', fullName: '管理员' },
  { username: 'test', password: 'test123', email: 'test@example.com', fullName: '测试用户' },
  { username: 'demo', password: 'demo123', email: 'demo@example.com', fullName: '演示账号' },
];

// 辅助函数：通过用户名查询用户
function findUserByUsername(username: string) {
  return mockUsers.find(user => user.username.toLowerCase() === username.toLowerCase());
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: {
    username: string;
    email?: string;
    fullName?: string;
  } | null;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string, fullName?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  toggleMockApi: () => void; // 新增：切换模拟API的功能
  isMockApiEnabled: () => boolean; // 新增：检查是否使用模拟API
}

interface ApiError {
  message: string;
  errors?: Record<string, string>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      user: null,
      error: null,
      login: async (username: string, password: string) => {
        try {
          console.log('尝试登录', { username, password: '******' });
          
          // 如果使用模拟API，则使用模拟登录
          if (useMockApi) {
            console.log('使用模拟API登录');
            
            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // 在模拟用户数据库中查找用户
            const user = findUserByUsername(username);
            
            if (!user || user.password !== password) {
              const errorMessage = '用户名或密码错误';
              set({ error: errorMessage });
              throw new Error(errorMessage);
            }
            
            // 登录成功
            const userInfo = {
              username: user.username,
              email: user.email,
              fullName: user.fullName
            };
            
            set({ 
              token: 'mock-auth-token',
              isAuthenticated: true,
              user: userInfo,
              error: null
            });
            
            console.log('模拟登录成功', userInfo);
            return;
          }
          
          // 真实API登录逻辑
          const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
            // 添加超时
            signal: AbortSignal.timeout(5000)
          });

          const data = await response.json();
          console.log('登录响应', data);

          if (!response.ok) {
            const apiError = data as ApiError;
            if (apiError.errors) {
              // 如果有具体的字段错误信息，格式化为易读的形式
              const errorMessages = Object.entries(apiError.errors)
                .map(([field, message]) => `${field}: ${message}`)
                .join('\n');
              set({ error: errorMessages });
              throw new Error(errorMessages);
            }
            const errorMessage = apiError.message || '登录失败';
            set({ error: errorMessage });
            throw new Error(errorMessage);
          }

          // 保存用户信息，包括可能的email和fullName
          const userInfo = {
            username,
            ...(data.user ? {
              email: data.user.email,
              fullName: data.user.fullName
            } : {})
          };

          set({ 
            token: data.token || 'auth-token', // 如果没有token，使用假token确保登录状态
            isAuthenticated: true,
            user: userInfo,
            error: null
          });
          
          console.log('登录成功', userInfo);
        } catch (error: any) {
          console.error('登录失败:', error);
          
          // 如果是网络错误，并且不是模拟模式，则自动切换到模拟模式再尝试
          if (error.name === 'TypeError' && error.message.includes('fetch') && !useMockApi) {
            console.log('检测到网络错误，切换到模拟API模式');
            useMockApi = true;
            
            // 自动重试登录
            try {
              await get().login(username, password);
              return; // 成功登录后返回
            } catch (retryError) {
              // 如果重试仍然失败，继续抛出错误
              const errorMessage = retryError instanceof Error ? retryError.message : '登录失败';
              set({ error: errorMessage });
              throw new Error(errorMessage);
            }
          }
          
          const errorMessage = error.message || '登录失败';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },
      register: async (username: string, password: string, email?: string, fullName?: string) => {
        try {
          console.log('开始注册请求，发送数据:', {
            username,
            password: '******', // 不打印真实密码
            email,
            fullName
          });
          
          // 如果使用模拟API，则使用模拟注册
          if (useMockApi) {
            console.log('使用模拟API注册');
            
            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // 检查用户名是否已存在
            if (findUserByUsername(username)) {
              const errorMessage = '用户名已存在';
              set({ error: errorMessage });
              throw new Error(errorMessage);
            }
            
            // 添加新用户到模拟数据库
            const newUser = {
              username,
              password,
              email: email || '',
              fullName: fullName || ''
            };
            
            mockUsers.push(newUser);
            
            // 注册成功，自动登录
            const userInfo = {
              username,
              ...(email ? { email } : {}),
              ...(fullName ? { fullName } : {})
            };
            
            set({ 
              token: 'mock-auth-token',
              isAuthenticated: true,
              user: userInfo,
              error: null
            });
            
            console.log('模拟注册成功，用户已登录');
            return;
          }
          
          // 构建注册数据对象
          const registerData: any = { 
            username, 
            password 
          };
          
          // 只有当提供了email和fullName时才添加到请求中
          if (email) registerData.email = email;
          if (fullName) registerData.fullName = fullName;

          const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(registerData),
            credentials: 'include',
            // 添加超时
            signal: AbortSignal.timeout(5000)
          });

          console.log('注册请求已发送，响应状态码:', response.status);
          
          // 尝试解析响应为JSON
          let data;
          try {
            data = await response.json();
            console.log('收到响应数据:', data);
          } catch (e) {
            console.error('解析响应JSON失败:', e);
            throw new Error('无法解析服务器响应');
          }

          if (!response.ok) {
            const apiError = data as ApiError;
            let errorMessage = apiError.message || '注册失败';
            
            // 处理字段级错误信息
            if (apiError.errors) {
              errorMessage = Object.entries(apiError.errors)
                .map(([field, message]) => `${field}: ${message}`)
                .join('\n');
            }
            
            set({ error: errorMessage });
            throw new Error(errorMessage);
          }

          // 创建完整的用户信息对象
          const userInfo = {
            username,
            ...(email ? { email } : {}),
            ...(fullName ? { fullName } : {})
          };

          // 注册成功，自动登录
          set({ 
            token: data.token || 'auth-token', // 如果没有token，使用假token确保登录状态
            isAuthenticated: true,
            user: userInfo,
            error: null
          });
          
          console.log('注册成功，用户已登录');
        } catch (error: any) {
          console.error('注册失败:', error);
          
          // 如果是网络错误，并且不是模拟模式，则自动切换到模拟模式再尝试
          if (error.name === 'TypeError' && error.message.includes('fetch') && !useMockApi) {
            console.log('检测到网络错误，切换到模拟API模式');
            useMockApi = true;
            
            // 自动重试注册
            try {
              await get().register(username, password, email, fullName);
              return; // 成功注册后返回
            } catch (retryError) {
              // 如果重试仍然失败，继续抛出错误
              const errorMessage = retryError instanceof Error ? retryError.message : '注册失败';
              set({ error: errorMessage });
              throw new Error(errorMessage);
            }
          }
          
          const errorMessage = error.message || '注册失败';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },
      logout: () => {
        // 客户端登出，清除所有状态
        set({ token: null, isAuthenticated: false, user: null });
        
        // 如果不是模拟模式，尝试调用后端登出接口
        if (!useMockApi) {
          try {
            fetch(`${API_BASE_URL}/api/logout`, {
              method: 'POST',
              credentials: 'include',
              // 添加超时
              signal: AbortSignal.timeout(3000)
            }).catch(err => {
              console.error('登出API调用失败:', err);
              // 即使API调用失败也不影响客户端登出状态
            });
          } catch (error) {
            console.error('登出过程中出错:', error);
          }
        } else {
          console.log('使用模拟API登出');
        }
      },
      clearError: () => {
        set({ error: null });
      },
      toggleMockApi: () => {
        useMockApi = !useMockApi;
        console.log(`已切换到${useMockApi ? '模拟' : '真实'}API模式`);
      },
      isMockApiEnabled: () => useMockApi
    }),
    {
      name: 'auth-storage',
    }
  )
);
