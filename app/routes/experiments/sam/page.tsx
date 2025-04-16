'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import SAMVideoPlayer from '@/components/media/SAMVideoPlayer'

export default function SAMExperimentPage() {
  const router = useRouter()
  const { isAuthenticated, username, userId } = useAuth()
  
  // 检查用户是否已经登录，如果没有则重定向到登录页
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          SAM实验 - 情感评估
        </h1>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          返回主页
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <SAMVideoPlayer username={username || ''} userId={userId || 0} />
      </div>
    </div>
  )
}
