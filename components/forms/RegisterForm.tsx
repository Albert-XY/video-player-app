'use client'

import { useState } from 'react'
import { handleFetchError } from '@/lib/utils'
import { AUTH_ENDPOINTS } from '@/lib/config'

interface RegisterFormProps {
  onSuccess: () => void
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    if (!username || !email || !password || !confirmPassword || !fullName) {
      setError('请填写所有必填项')
      return false
    }
    if (username.length < 3) {
      setError('用户名至少需要3个字符')
      return false
    }
    if (password.length < 6) {
      setError('密码至少需要6个字符')
      return false
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入有效的邮箱地址')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch(AUTH_ENDPOINTS.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          password,
          email,
          fullName
        }),
      })

      if (!response.ok) {
        let errorMessage = '注册失败';
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
        console.log('注册成功:', data);
        // 可以在这里处理返回的数据
      } catch (parseError) {
        console.log('响应解析失败，但注册状态视为成功');
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
      <h2 className="auth-title">注册新账号</h2>
      
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
          minLength={3}
        />
      </div>

      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
          placeholder="邮箱"
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
          minLength={6}
        />
      </div>

      <div>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="auth-input"
          placeholder="确认密码"
          required
        />
      </div>

      <div>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="auth-input"
          placeholder="姓名"
          required
        />
      </div>

      <button 
        type="submit" 
        className="auth-button"
        disabled={isLoading}
      >
        {isLoading ? '注册中...' : '注册'}
      </button>
    </form>
  )
}
