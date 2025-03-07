'use client';

import { useRouter } from 'next/navigation';

interface ExperimentSelectionProps {
  onBack: () => void;
}

export default function ExperimentSelection({ onBack }: ExperimentSelectionProps) {
  const router = useRouter();
  
  const handleTaskExperiment = () => {
    router.push('/task-experiment');
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">选择实验类型</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-indigo-50 p-5 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-3 text-indigo-700">任务态实验</h3>
          <p className="mb-4">
            参与视频观看任务态实验，我们将研究视频内容对人类情感和认知的影响。
            实验中您将观看5个经过SAM筛选的视频。
          </p>
          <ul className="list-disc pl-5 mb-4 text-sm">
            <li>填写个人基本信息与PHQ-9评估</li>
            <li>连续观看5个视频(间隔休息)</li>
            <li>实验数据将用于情感计算研究</li>
          </ul>
          <button
            onClick={handleTaskExperiment}
            className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            开始任务态实验
          </button>
        </div>
        
        <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">静息态实验</h3>
          <p className="mb-4">
            静息态实验目前正在开发中，将在未来版本中推出。
            该实验将研究静息状态下视频内容对人类情感的影响。
          </p>
          <ul className="list-disc pl-5 mb-4 text-sm">
            <li>填写基本信息与状态评估</li>
            <li>静息状态下观看视频</li>
            <li>记录情感变化数据</li>
          </ul>
          <button
            disabled
            className="w-full py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
          >
            即将推出
          </button>
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          返回
        </button>
      </div>
    </div>
  );
}
