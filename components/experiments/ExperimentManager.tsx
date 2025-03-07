'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/media/VideoPlayer';
import RestScreen from './RestScreen';

interface ExperimentManagerProps {
  experimentId: string;
  onExperimentEnd: () => void;
  onExperimentCancel: () => void;
}

interface Video {
  id: number;
  title: string;
  path: string;
}

export default function ExperimentManager({ 
  experimentId, 
  onExperimentEnd, 
  onExperimentCancel 
}: ExperimentManagerProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [playedVideos, setPlayedVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isResting, setIsResting] = useState(false);
  const [isExperimentActive, setIsExperimentActive] = useState(true);
  const [experimentStarted, setExperimentStarted] = useState(false); 
  const [error, setError] = useState('');
  const [videosStartTimes, setVideosStartTimes] = useState<{[key: number]: Date}>({});
  const [videosEndTimes, setVideosEndTimes] = useState<{[key: number]: Date}>({});

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/videos`);
        if (!response.ok) {
          throw new Error(`API错误: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.length > 0) {
          setVideos(data);
          if (experimentStarted) {
            selectNextVideo(data, []);
          }
        } else {
          setError('没有可用的视频');
        }
      } catch (error) {
        console.error('获取视频时出错:', error);
        setError('无法加载视频数据，请稍后再试');
      }
    };

    if (isExperimentActive) {
      fetchVideos();
    }
  }, [isExperimentActive, experimentStarted]); 

  const selectNextVideo = (allVideos: Video[], played: Video[]) => {
    const unwatchedVideos = allVideos.filter(
      (video) => !played.some((playedVideo) => playedVideo.id === video.id)
    );
    
    if (unwatchedVideos.length === 0) {
      setIsExperimentActive(false);
      onExperimentEnd();
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * unwatchedVideos.length);
    const selectedVideo = unwatchedVideos[randomIndex];
    
    setCurrentVideo(selectedVideo);
    setVideosStartTimes(prev => ({
      ...prev,
      [selectedVideo.id]: new Date()
    }));
  };

  const handleVideoComplete = async () => {
    if (!currentVideo) return;
    
    setVideosEndTimes(prev => ({
      ...prev,
      [currentVideo.id]: new Date()
    }));
    
    const updatedPlayedVideos = [...playedVideos, currentVideo];
    setPlayedVideos(updatedPlayedVideos);
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/experiments/${experimentId}/videos/${currentVideo.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: videosStartTimes[currentVideo.id],
          endTime: new Date()
        })
      });
    } catch (error) {
      console.error('记录视频完成时出错:', error);
    }
    
    if (updatedPlayedVideos.length >= 5) {
      setIsExperimentActive(false);
      onExperimentEnd();
    } else {
      setIsResting(true);
      setCurrentVideo(null);
    }
  };

  const handleRestComplete = () => {
    setIsResting(false);
    selectNextVideo(videos, playedVideos);
  };

  const handleCancelExperiment = () => {
    setIsExperimentActive(false);
    onExperimentCancel();
  };

  const handleStartExperiment = () => {
    setExperimentStarted(true);
    selectNextVideo(videos, playedVideos);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>{error}</p>
        <button 
          onClick={handleCancelExperiment}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          结束实验
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {isExperimentActive && (
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm font-semibold">
            正在进行实验 - ID: {experimentId}
          </div>
          <div className="text-sm">
            已播放: {playedVideos.length} / 5 个视频
          </div>
          <button 
            onClick={handleCancelExperiment}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            终止实验
          </button>
        </div>
      )}

      {isResting ? (
        <RestScreen onRestComplete={handleRestComplete} restDuration={60} />
      ) : currentVideo && experimentStarted ? (
        <VideoPlayer 
          video={currentVideo} 
          experimentId={experimentId}
          onVideoComplete={handleVideoComplete}
          disableControls={true} 
        />
      ) : !experimentStarted ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              实验准备
            </h3>
            <p className="text-yellow-700 mb-2">请确认在开始实验前已经打开相关软件记录脑电信号。</p>
            <ul className="list-disc pl-5 text-sm text-yellow-600">
              <li>实验将自动播放5个视频，每个视频之间有60秒休息时间</li>
              <li>视频播放过程中请保持专注，不要暂停或跳过</li>
              <li>所有实验数据将被记录并用于研究分析</li>
            </ul>
          </div>
          <div className="text-center">
            <button
              onClick={handleStartExperiment}
              className="px-6 py-3 bg-green-600 text-white text-lg rounded-md hover:bg-green-700 transition-colors"
            >
              开始实验
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 bg-gray-100 rounded">
          <p className="text-gray-500">加载视频中...</p>
        </div>
      )}
    </div>
  );
}
