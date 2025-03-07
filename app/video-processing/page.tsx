'use client';

import { useState } from 'react';
import SAMExperimentStats from '@/components/experiments/SAMExperimentStats';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function VideoProcessingPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'data' | 'settings'>('stats');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 0h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">需要登录</h2>
          <p className="text-gray-600 mb-4">请先登录以访问视频处理系统。</p>
          <Link href="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            返回首页登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">视频处理系统</h1>
          <p className="text-gray-600">
            查看SAM评估状态和视频筛选进度
          </p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="border-b">
            <nav className="flex">
              <button
                className={`px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'stats' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('stats')}
              >
                评估统计
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'data' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('data')}
              >
                视频数据
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'settings' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                筛选设置
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'stats' && <SAMExperimentStats />}
            
            {activeTab === 'data' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">视频数据概览</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-indigo-700 mb-1">--</div>
                    <div className="text-sm text-indigo-600">RVM筛选视频总数</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-green-700 mb-1">--</div>
                    <div className="text-sm text-green-600">SAM通过视频数</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-700 mb-1">--</div>
                    <div className="text-sm text-yellow-600">待评估视频数</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mt-6">
                  <p className="text-sm text-gray-700">
                    视频数据模块正在开发中，将提供更详细的视频数据分析和流程监控功能。
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">筛选参数设置</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">RVM筛选参数</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          最小筛选分数
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="1.0"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          效价阈值
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="0.5"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">SAM评估参数</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          最小评分数量
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="16"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          最大评分方差
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="0.06"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-yellow-700">
                      参数设置功能正在开发中，当前使用系统默认值。修改这些参数将影响视频筛选的质量和数量。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
