'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function ExperimentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { username } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">视频实验平台</h1>
              {username && (
                <span className="ml-4 text-sm text-gray-600">欢迎，{username}</span>
              )}
            </div>
            <nav className="flex space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                首页
              </Link>
              <Link href="/experiments/sam" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                SAM实验
              </Link>
              <Link href="/experiments/regular" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                标准实验
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
