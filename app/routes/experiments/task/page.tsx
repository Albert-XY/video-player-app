'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TaskExperimentEntry from '@/components/experiments/TaskExperimentEntry';
import ExperimentManager from '@/components/experiments/ExperimentManager';
import ExperimentSetup from '@/components/experiments/ExperimentSetup';
import { PersonalInfo } from '@/components/forms/PersonalInfoForm';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function TaskExperimentPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [view, setView] = useState<'intro' | 'setup' | 'experiment' | 'completed'>('intro');
  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [experimentCompleted, setExperimentCompleted] = useState(false);
  const [experimentResults, setExperimentResults] = useState<any>(null);
  const [experimentSetupData, setExperimentSetupData] = useState<{
    personalInfo: PersonalInfo;
    phq9Score: number;
    phq9Answers: number[];
  } | null>(null);
  // 确保完全使用真实API，不使用任何模拟数据

  // 开始实验前的介绍
  const handleStartExperiment = () => {
    setView('setup');
  };

  // 完成实验设置（个人信息和PHQ-9量表）
  const handleExperimentSetupComplete = async (data: {
    personalInfo: PersonalInfo;
    phq9Score: number;
    phq9Answers: number[];
  }) => {
    setExperimentSetupData(data);
    
    try {
      setMessage('正在保存实验数据...');
      
      // 调用真实后端API创建实验
      const response = await fetch('/api/experiments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'task',
          userData: data,
          userId: user?.id || 'anonymous'
        }),
      });
      
      if (!response.ok) {
        throw new Error('创建实验失败：' + (await response.text()));
      }
      
      const result = await response.json();
      setExperimentId(result.experimentId);
      setView('experiment');
      setMessage('');
    } catch (err) {
      console.error('保存实验数据失败', err);
      setError('保存实验数据失败，请重试：' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // 完成实验
  const handleExperimentComplete = async (results: any) => {
    try {
      setMessage('正在提交实验结果...');
      setExperimentResults(results);
      
      // 等待1秒模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setExperimentCompleted(true);
      setView('completed');
      setMessage('');
    } catch (err) {
      console.error('提交实验结果失败', err);
      setError('提交实验结果失败，请重试');
    }
  };

  // 检查用户是否已登录
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">需要登录</h2>
            <p className="mt-2 text-sm text-gray-600">
              请先登录后再参与实验
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-center">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                去登录
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        {view === 'intro' && (
          <TaskExperimentEntry onStart={handleStartExperiment} />
        )}

        {view === 'setup' && (
          <ExperimentSetup 
            onComplete={handleExperimentSetupComplete} 
          />
        )}

        {view === 'experiment' && experimentId && (
          <ExperimentManager
            experimentId={experimentId}
            personalInfo={experimentSetupData?.personalInfo || null}
            phq9Score={experimentSetupData?.phq9Score || 0}
            phq9Answers={experimentSetupData?.phq9Answers || []}
            onComplete={handleExperimentComplete}
            useMockApi={false} // 确保不使用模拟API
          />
        )}

        {view === 'completed' && (
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-green-600 mb-6">
              实验完成！
            </h2>
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700">
                感谢您参与本次实验。您的数据已成功提交。
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                返回首页
              </button>
            </div>

            {experimentResults && (
              <div className="mt-8 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h3 className="text-lg font-medium mb-2">实验数据摘要：</h3>
                <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                  {JSON.stringify(experimentResults, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {message && (
          <div className="fixed bottom-4 right-4 bg-blue-50 text-blue-700 px-4 py-2 rounded-md shadow">
            {message}
          </div>
        )}

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-50 text-red-700 px-4 py-2 rounded-md shadow">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}
