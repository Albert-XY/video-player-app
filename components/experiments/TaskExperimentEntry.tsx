'use client';

import { useState } from 'react';
import { PersonalInfo } from '../forms/PersonalInfoForm';

interface TaskExperimentEntryProps {
  onStartExperiment: () => void;
}

export default function TaskExperimentEntry({ onStartExperiment }: TaskExperimentEntryProps) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">视频观看任务态实验</h2>
      <div className="bg-indigo-50 p-4 rounded-md mb-6">
        <h3 className="text-lg font-semibold mb-2">实验说明</h3>
        <p className="mb-2">
          本实验旨在研究视频观看过程中的任务态体验。您将依次观看5个短视频，
          每个视频播放完毕后有1分钟的休息时间。
        </p>
        <p className="mb-2">
          <strong>重要提示：</strong>一旦开始实验，视频将会自动播放并且不能暂停。
          整个过程大约需要15-20分钟，请确保有足够的时间完成实验。
        </p>
        <p>
          点击下方按钮开始实验前的准备工作，您需要填写个人信息表和PHQ-9抑郁量表。
        </p>
      </div>
      
      <div className="space-y-2 mb-6">
        <h4 className="font-medium">实验流程：</h4>
        <ol className="list-decimal pl-5 space-y-1">
          <li>填写个人基本信息</li>
          <li>完成PHQ-9抑郁量表评估</li>
          <li>观看5个视频（每个视频之间有1分钟休息时间）</li>
          <li>完成实验，查看数据</li>
        </ol>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <h3 className="text-sm font-semibold mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          视频筛选流程
        </h3>
        <p className="text-sm text-blue-800">
          实验中使用的视频已经过两阶段筛选：首先通过RVM线性回归模型进行初筛，
          然后通过SAM量表评估确保视频能够引起预期的情感反应。
          这确保实验中的每个视频都具有可靠的情感反应特性。
        </p>
      </div>
      
      <button
        onClick={onStartExperiment}
        className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        开始实验
      </button>
    </div>
  );
}
