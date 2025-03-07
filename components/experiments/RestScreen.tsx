'use client';

import { useEffect, useState } from 'react';

interface RestScreenProps {
  onRestComplete: () => void;
  restDuration: number; // 休息时间，单位为秒
}

export default function RestScreen({ onRestComplete, restDuration = 60 }: RestScreenProps) {
  const [remainingTime, setRemainingTime] = useState(restDuration);

  useEffect(() => {
    // 重置计时器
    setRemainingTime(restDuration);
    
    // 创建倒计时定时器
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onRestComplete(); // 休息结束后调用回调函数
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // 清理定时器
    return () => clearInterval(timer);
  }, [restDuration, onRestComplete]);

  // 格式化剩余时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-4">休息时间</h2>
      <p className="mb-6 text-gray-600">下一个视频将在 {formatTime(remainingTime)} 后开始播放</p>
      <div className="w-full max-w-md bg-gray-300 h-2 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-600 transition-all duration-1000 ease-linear" 
          style={{ width: `${(remainingTime / restDuration) * 100}%` }}
        ></div>
      </div>
      <p className="mt-6 text-sm text-gray-500">请稍作休息，不要离开实验页面</p>
    </div>
  );
}
