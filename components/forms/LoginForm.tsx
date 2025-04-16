'use client'

import { useState } from 'react'
import { AUTH_ENDPOINTS } from '@/lib/config'

interface LoginFormProps {
  onSuccess: () => void
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('请输入用户名和密码')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(AUTH_ENDPOINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        let errorMessage = '登录失败';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            errorMessage = data.error || errorMessage;
          } else {
            const text = await response.text();
            errorMessage = text || errorMessage;
          }
        } catch (parseError) {
          console.error('解析响应失败:', parseError);
        }
        throw new Error(errorMessage);
      }

      try {
        const data = await response.json();
        console.log('登录成功:', data);
        // 可以在这里处理返回的数据，例如保存token等
      } catch (parseError) {
        console.log('响应解析失败，但登录状态视为成功');
      }

      onSuccess()
    } catch (error) {
      setError(error instanceof Error ? error.message : '发生未知错误')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="auth-title">登录账号</h2>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="auth-input"
          placeholder="用户名"
          required
        />
      </div>

      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
          placeholder="密码"
          required
        />
      </div>

      <button 
        type="submit" 
        className="auth-button"
        disabled={isLoading}
      >
        {isLoading ? '登录中...' : '登录'}
      </button>
    </form>
  )
}
