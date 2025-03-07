'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const schema = yup.object({
  username: yup.string().required('用户名是必填项'),
  password: yup.string().required('密码是必填项'),
}).required();

type FormData = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { login, error: authError, isAuthenticated, clearError } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  // 检查用户是否已经登录，如果是则重定向到主页
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // 当组件卸载时清除错误
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // 如果有认证错误，显示在页面上
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      setIsSubmitting(true);
      await login(data.username, data.password);
      // 登录成功后会通过 useEffect 中的重定向逻辑自动跳转
    } catch (err: any) {
      console.error('登录失败:', err);
      setError(err.message || '登录失败，请检查用户名和密码');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录到视频实验平台
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            或{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              注册新账号
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username-input" className="sr-only">用户名</label>
              <input
                {...register('username')}
                id="username-input"
                name="username"
                type="text"
                autoComplete="username"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="用户名"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password-input" className="sr-only">密码</label>
              <input
                {...register('password')}
                id="password-input"
                name="password"
                type="password"
                autoComplete="current-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="密码"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isSubmitting ? '登录中...' : '登录'}
            </button>
          </div>
          
          <div className="text-center">
            <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              返回首页
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
