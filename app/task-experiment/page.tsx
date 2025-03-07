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
  const [useMockApi] = useState<boolean>(false);

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
      // 生成一个随机ID作为实验ID
      const mockExperimentId = `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setMessage('正在保存实验数据...');
      
      // 等待1秒模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setExperimentId(mockExperimentId);
      setView('experiment');
      setMessage('');
    } catch (error) {
      console.error('保存实验数据时出错:', error);
      setError('无法创建实验，请稍后再试');
    }
  };

  // 实验结束
  const handleExperimentEnd = async () => {
    try {
      setMessage('正在处理实验结果...');
      
      // 等待1秒模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResults = {
        experimentId: experimentId,
        completionTime: new Date().toISOString(),
        participantData: experimentSetupData,
        responses: [
          { videoId: 1, valence: 0.7, arousal: 0.8 },
          { videoId: 2, valence: 0.3, arousal: 0.6 },
          { videoId: 3, valence: 0.5, arousal: 0.4 }
        ],
        metrics: {
          averageResponseTime: 5.33,
          completionStatus: "成功",
          totalTimeSpent: 120.5
        }
      };
      
      setExperimentResults(mockResults);
      setExperimentCompleted(true);
      setView('completed');
      setMessage('实验已成功完成！');
    } catch (error) {
      console.error('获取实验结果时出错:', error);
      setError('无法获取实验结果，但实验已完成');
      setExperimentCompleted(true);
    }
  };

  // 取消实验
  const handleExperimentCancel = () => {
    setExperimentId(null);
    setMessage('实验已取消，数据未保存');
    setView('intro');
  };

  // 开始新实验
  const handleNewExperiment = () => {
    setExperimentId(null);
    setExperimentCompleted(false);
    setExperimentResults(null);
    setExperimentSetupData(null);
    setView('intro');
    setMessage('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 0h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">需要登录</h2>
          <p className="text-gray-600 mb-4">请先登录以访问任务态实验系统。</p>
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
          <h1 className="text-3xl font-bold mb-2">视频任务态实验</h1>
          <p className="text-gray-600">
            体验并评估视频内容对人类情感的影响
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          {view === 'intro' && (
            <TaskExperimentEntry onStartExperiment={handleStartExperiment} />
          )}

          {view === 'setup' && (
            <ExperimentSetup onComplete={handleExperimentSetupComplete} />
          )}

          {view === 'experiment' && experimentId && (
            <ExperimentManager
              experimentId={experimentId}
              onExperimentEnd={handleExperimentEnd}
              onExperimentCancel={handleExperimentCancel}
            />
          )}

          {view === 'completed' && (
            <div className="p-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h2 className="text-xl font-semibold text-green-800 mb-4">实验已完成</h2>
                
                {experimentSetupData && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">参与者信息</h3>
                    <div className="bg-white p-3 rounded border border-gray-200 mb-2">
                      <p><strong>姓名:</strong> {experimentSetupData.personalInfo.name}</p>
                      <p><strong>年龄:</strong> {experimentSetupData.personalInfo.age}</p>
                      <p><strong>PHQ-9得分:</strong> {experimentSetupData.phq9Score}</p>
                    </div>
                  </div>
                )}
                
                {experimentResults && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">实验结果</h3>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(experimentResults, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <button
                    onClick={handleNewExperiment}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    开始新实验
                  </button>
                  
                  <Link
                    href="/"
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex justify-center items-center"
                  >
                    返回首页
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
