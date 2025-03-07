'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const schema = yup.object({
  username: yup.string()
    .required('用户名是必填项')
    .min(3, '用户名至少需要3个字符')
    .max(20, '用户名最多20个字符'),
  email: yup.string()
    .required('邮箱是必填项')
    .email('请输入有效的邮箱地址'),
  password: yup.string()
    .required('密码是必填项')
    .min(6, '密码至少需要6个字符'),
  confirmPassword: yup.string()
    .required('请确认密码')
    .oneOf([yup.ref('password')], '两次输入的密码不一致'),
  fullName: yup.string()
    .required('姓名是必填项')
    .max(50, '姓名最多50个字符'),
}).required();

type FormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, error: authError, clearError, isAuthenticated } = useAuth();
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
      await registerUser(data.username, data.password, data.email, data.fullName);
      // 注册成功后会通过 useEffect 中的重定向逻辑自动跳转
    } catch (err: any) {
      console.error('注册失败:', err);
      setError(err.message || '注册失败，请稍后再试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          注册新账号
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          已有账号？{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            点击登录
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline whitespace-pre-line">{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username-input" className="block text-sm font-medium text-gray-700">
                  用户名
                </label>
                <input
                  {...register('username')}
                  id="username-input"
                  name="username"
                  type="text"
                  autoComplete="username"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="请输入用户名"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email-input" className="block text-sm font-medium text-gray-700">
                  邮箱
                </label>
                <input
                  {...register('email')}
                  id="email-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="请输入邮箱地址"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password-input" className="block text-sm font-medium text-gray-700">
                  密码
                </label>
                <input
                  {...register('password')}
                  id="password-input"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="请输入密码"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirm-password-input" className="block text-sm font-medium text-gray-700">
                  确认密码
                </label>
                <input
                  {...register('confirmPassword')}
                  id="confirm-password-input"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="请再次输入密码"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="fullname-input" className="block text-sm font-medium text-gray-700">
                  姓名
                </label>
                <input
                  {...register('fullName')}
                  id="fullname-input"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="请输入您的姓名"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {isSubmitting ? '注册中...' : '注册'}
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
    </div>
  );
}
