'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VideoPlayer from '@/components/media/VideoPlayer';
import SAMScale from '@/components/experiments/SAMScale';
import ExperimentSelection from '@/components/experiments/ExperimentSelection';
import { useAuth } from '@/hooks/useAuth';

interface Video {
  id: string | number;
  title: string;
  src: string;
}

export default function VideoExperimentPlatform() {
  const router = useRouter();
  const { user } = useAuth();
  const [view, setView] = useState<'main' | 'sam-experiment' | 'experiment-selection' | 'completion'>('main');
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showSAMScale, setShowSAMScale] = useState(false);
  const [videosRated, setVideosRated] = useState(0);
  const [samStats, setSamStats] = useState<{
    totalVideos: number;
    approvedVideos: number;
    pendingVideos: number;
  }>({
    totalVideos: 0,
    approvedVideos: 0,
    pendingVideos: 0
  });

  // 加载平台统计信息
  useEffect(() => {
    fetchSamStats();
  }, []);

  // 获取SAM评估统计信息
  const fetchSamStats = async () => {
    try {
      const response = await fetch('/api/video-stats');
      if (!response.ok) {
        throw new Error('获取SAM统计信息失败');
      }
      
      const data = await response.json();
      const approved = data.filter(v => v.approval_status === 'approved').length;
      const pending = data.filter(v => v.approval_status === 'pending').length;
      
      setSamStats({
        totalVideos: data.length,
        approvedVideos: approved,
        pendingVideos: pending
      });
    } catch (error) {
      console.error('获取SAM统计信息时出错:', error);
    }
  };

  // 开始SAM评估实验
  const startSAMExperiment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/videos');
      if (!response.ok) {
        throw new Error(`获取视频失败: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (data.length === 0) {
        setError('没有可用的视频。请等待系统添加更多视频。');
      } else {
        setVideos(data);
        setCurrentVideo(data[0]);
        setView('sam-experiment');
      }
    } catch (error) {
      console.error('获取视频时出错:', error);
      setError('无法加载视频数据，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  // 打开实验选择界面
  const openExperimentSelection = () => {
    setView('experiment-selection');
  };

  // 处理视频播放结束
  const handleVideoEnd = () => {
    setShowSAMScale(true);
  };

  // 处理SAM评分提交
  const handleSAMSubmit = async (valence: number, arousal: number) => {
    if (!currentVideo || !user) return;

    try {
      setMessage('正在提交评分...');
      
      // 将9点量表转换为0-1范围
      const normalizedValence = (valence - 1) / 8; 
      const normalizedArousal = (arousal - 1) / 8;
      
      const response = await fetch('/api/sam-ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          videoId: currentVideo.id,
          valence: normalizedValence,
          arousal: normalizedArousal,
          watchDuration: 0 // 可以在未来添加视频观看时长统计
        }),
      });

      if (response.ok) {
        setMessage('评分提交成功！');
        setVideosRated(prev => prev + 1);
        
        // 选择下一个视频或完成评估
        const nextIndex = videos.findIndex(v => v.id === currentVideo?.id) + 1;
        if (nextIndex < videos.length) {
          setCurrentVideo(videos[nextIndex]);
          setShowSAMScale(false);
        } else {
          setMessage('所有视频评分已完成！');
          setView('completion');
          // 更新统计信息
          fetchSamStats();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || '提交评分失败');
      }
    } catch (error) {
      console.error('提交SAM评分时出错:', error);
      setError('提交评分失败，请稍后再试');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // 查看视频处理详情
  const viewVideoProcessing = () => {
    router.push('/video-processing');
  };

  // 渲染平台主页
  const renderMainView = () => (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">视频实验平台</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-5 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-3 text-blue-700">SAM情感评估</h3>
          <p className="mb-4">
            使用SAM量表(Self-Assessment Manikin)评估视频的情感效价和唤醒度，
            帮助我们筛选情感明确的视频用于后续研究。
          </p>
          <ul className="list-disc pl-5 mb-4 text-sm">
            <li>观看一系列待评估的视频</li>
            <li>使用SAM量表评估每个视频的情感</li>
            <li>您的评分将帮助我们确定视频是否符合情感研究标准</li>
          </ul>
          <button
            onClick={startSAMExperiment}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? '加载中...' : 'SAM情感评估视频'}
          </button>
        </div>
        
        <div className="bg-indigo-50 p-5 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-3 text-indigo-700">实验</h3>
          <p className="mb-4">
            参与视频观看实验，我们将研究视频内容对人类情感和认知的影响。
            您可以选择不同类型的实验参与。
          </p>
          <ul className="list-disc pl-5 mb-4 text-sm">
            <li>填写个人基本信息与状态评估</li>
            <li>根据实验类型观看视频</li>
            <li>实验数据将用于情感计算研究</li>
          </ul>
          <button
            onClick={openExperimentSelection}
            className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            开始实验
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium mb-3">视频筛选进度</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{samStats.totalVideos}</div>
              <div className="text-xs text-gray-500">待评估视频</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{samStats.approvedVideos}</div>
              <div className="text-xs text-gray-500">已通过视频</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{samStats.pendingVideos}</div>
              <div className="text-xs text-gray-500">评估中</div>
            </div>
          </div>
          <button
            onClick={viewVideoProcessing}
            className="w-full py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            查看视频处理详情
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium mb-2">实验说明：</h4>
        <p className="text-sm text-gray-700">
          我们通过SAM量表进行人工评估以确保视频能引起预期的情感反应。
          SAM量表可以有效测量视频引起的情感效价和唤醒度，您的评分将直接
          用于筛选合适的视频用于后续实验研究。
        </p>
      </div>
    </div>
  );

  // 渲染SAM实验界面
  const renderSAMExperiment = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <p>{error}</p>
          <button
            onClick={() => setView('main')}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            返回主页
          </button>
        </div>
      );
    }

    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">SAM情感评估实验</h2>
          
          {message && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
              {message}
            </div>
          )}
          
          <div className="mb-4">
            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">
              已评估: {videosRated} / {videos.length} 个视频
            </span>
          </div>

          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
            <p><strong>实验说明:</strong> 每个视频需要收集16人的评分才能完成评估。评分完成后，系统将计算平均值和方差，只有情感明确且评分一致性高的视频才会被保留。</p>
          </div>

          {!showSAMScale && currentVideo ? (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={currentVideo.src}
                  controls
                  className="w-full h-full"
                  onEnded={handleVideoEnd}
                  autoPlay
                />
              </div>
              <h3 className="text-lg font-medium">{currentVideo.title}</h3>
              <p className="text-sm text-gray-500">
                请完整观看视频，结束后将显示SAM评分表
              </p>
            </div>
          ) : (
            currentVideo && (
              <div>
                <h3 className="text-lg font-medium mb-4">对刚才观看的视频进行评分：</h3>
                <SAMScale onSubmit={handleSAMSubmit} />
              </div>
            )
          )}
          
          <div className="mt-4">
            <button
              onClick={() => setView('main')}
              className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              取消并返回
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染实验选择界面
  const renderExperimentSelection = () => (
    <ExperimentSelection onBack={() => setView('main')} />
  );

  // 渲染完成页面
  const renderCompletion = () => (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">评估完成!</h2>
        <p className="text-gray-600 mb-6">
          感谢您完成所有视频的SAM情感评估。您的反馈对我们的研究非常重要。
        </p>
        
        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">评估统计</h3>
            <p>您已经完成了 <strong>{videosRated}</strong> 个视频的情感评估。</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setView('main')} 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            返回主页
          </button>
          <button
            onClick={openExperimentSelection}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            开始实验
          </button>
        </div>
      </div>
    </div>
  );

  // 根据当前视图渲染内容
  const renderContent = () => {
    switch (view) {
      case 'main':
        return renderMainView();
      case 'sam-experiment':
        return renderSAMExperiment();
      case 'experiment-selection':
        return renderExperimentSelection();
      case 'completion':
        return renderCompletion();
      default:
        return renderMainView();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {renderContent()}
    </div>
  );
}
