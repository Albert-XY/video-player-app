'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// API基础URL配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: any | null;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string, fullName: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

interface ApiError {
  message: string;
  errors?: Record<string, string>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      user: null,
      error: null,
      login: async (username: string, password: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
          });

          const data = await response.json();

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

          if (!data.token) {
            throw new Error('服务器响应中没有token');
          }

          set({ 
            token: data.token, 
            isAuthenticated: true,
            user: { username },
            error: null
          });
        } catch (error: any) {
          console.error('登录失败:', error);
          const errorMessage = error.message || '登录失败';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },
      register: async (username: string, password: string, email: string, fullName: string) => {
        try {
          console.log('开始注册请求，发送数据:', {
            username,
            email,
            fullName,
            password: '***'
          });

          const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ 
              username, 
              password, 
              email, 
              fullName 
            }),
            credentials: 'include',
          });

          console.log('收到响应状态:', response.status);
          const data = await response.json();
          console.log('响应数据:', data);

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
            const errorMessage = apiError.message || '注册失败';
            set({ error: errorMessage });
            throw new Error(errorMessage);
          }

          if (!data.token) {
            throw new Error('服务器响应中没有token');
          }

          set({ 
            token: data.token, 
            isAuthenticated: true,
            user: { username, email, fullName },
            error: null
          });
        } catch (error: any) {
          console.error('注册失败:', error);
          const errorMessage = error.message || '注册失败，请稍后重试';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },
      logout: () => {
        set({ token: null, isAuthenticated: false, user: null, error: null });
      },
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);
