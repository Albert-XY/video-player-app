'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/forms/LoginForm'
import RegisterForm from '@/components/forms/RegisterForm'
import { useAuth } from '@/hooks/useAuth'
import Background3D from '@/components/ui/3d/Background3D'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, username, userId, logout } = useAuth()
  const [showLogin, setShowLogin] = useState(true)
  const [playerChoice, setPlayerChoice] = useState<'sam' | 'regular' | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleLoginSuccess = () => {
    // 登录成功后会自动更新 isAuthenticated
  }

  const handleLogout = async () => {
    try {
      await logout()
      setMessage('成功退出登录')
    } catch (error) {
      setError('退出登录失败')
    }
  }
  
  // 当用户选择实验类型时，直接导航到相应页面
  useEffect(() => {
    if (playerChoice === 'sam') {
      router.push('/experiments/sam')
    } else if (playerChoice === 'regular') {
      router.push('/experiments/regular')
    }
  }, [playerChoice, router])

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              欢迎回来，{username}
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              退出登录
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <button
              onClick={() => setPlayerChoice('sam')}
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">SAM Scale 视频播放器</h3>
              <p className="text-gray-600">使用 SAM Scale 评估视频情感效果</p>
            </button>
            <button
              onClick={() => setPlayerChoice('regular')}
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">实验视频播放器</h3>
              <p className="text-gray-600">参与视频实验研究</p>
            </button>
          </div>
          
          {message && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">
          视频实验平台
        </h1>
        
        {showLogin ? (
          <>
            <LoginForm onSuccess={handleLoginSuccess} />
            <div className="mt-4 text-center">
              <span className="text-gray-600">还没有账号？</span>
              <button 
                className="auth-link ml-2"
                onClick={() => setShowLogin(false)}
              >
                立即注册
              </button>
            </div>
          </>
        ) : (
          <>
            <RegisterForm onSuccess={() => setShowLogin(true)} />
            <div className="mt-4 text-center">
              <span className="text-gray-600">已有账号？</span>
              <button 
                className="auth-link ml-2"
                onClick={() => setShowLogin(true)}
              >
                点击登录
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}