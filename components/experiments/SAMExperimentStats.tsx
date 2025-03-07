'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Rating {
  id: number;
  video_title: string;
  sam_valence: number;
  sam_arousal: number;
  rating_date: string;
}

interface VideoStat {
  id: number;
  title: string;
  total_ratings: number;
  approval_status: string;
}

export default function SAMExperimentStats() {
  const { user } = useAuth();
  const [userRatings, setUserRatings] = useState<Rating[]>([]);
  const [videoStats, setVideoStats] = useState<VideoStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserRatings();
      fetchVideoStats();
    }
  }, [user]);

  const fetchUserRatings = async () => {
    try {
      const response = await fetch(`/api/user-ratings?userId=${user?.id}`);
      if (!response.ok) {
        throw new Error('获取评分历史失败');
      }
      const data = await response.json();
      setUserRatings(data);
    } catch (error) {
      console.error('获取用户评分记录时出错:', error);
      setError('无法加载您的评分历史');
    }
  };

  const fetchVideoStats = async () => {
    try {
      const response = await fetch('/api/video-stats');
      if (!response.ok) {
        throw new Error('获取视频状态失败');
      }
      const data = await response.json();
      setVideoStats(data);
    } catch (error) {
      console.error('获取视频统计信息时出错:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">您的SAM评分历史</h2>
        
        {error && (
          <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {userRatings.length === 0 ? (
          <p className="text-gray-500">您尚未提交任何SAM评分</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">视频标题</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">效价</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">唤醒度</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评分日期</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userRatings.map((rating) => (
                  <tr key={rating.id}>
                    <td className="px-4 py-2 whitespace-nowrap">{rating.video_title}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{(rating.sam_valence * 8 + 1).toFixed(1)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{(rating.sam_arousal * 8 + 1).toFixed(1)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(rating.rating_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">视频筛选状态</h2>
        
        {videoStats.length === 0 ? (
          <p className="text-gray-500">暂无视频统计信息</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">视频标题</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评分数量</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {videoStats.map((video) => (
                  <tr key={video.id}>
                    <td className="px-4 py-2 whitespace-nowrap">{video.title}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{video.total_ratings}/16</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span 
                        className={`px-2 py-1 text-xs rounded-full ${
                          video.approval_status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : video.approval_status === 'rejected' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {video.approval_status === 'approved' 
                          ? '已通过' 
                          : video.approval_status === 'rejected' 
                            ? '未通过' 
                            : '评估中'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-medium mb-2">SAM筛选标准</h3>
        <p className="text-sm text-gray-700">
          视频需满足以下条件才能通过筛选:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
          <li>获得至少16个用户的SAM评分</li>
          <li>SAM评分的效价和唤醒度方向与RVM预测一致</li>
          <li>用户评分的方差较小，表明评分者对视频情感的判断比较一致</li>
        </ul>
      </div>
    </div>
  );
}
