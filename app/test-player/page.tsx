'use client';

import { useEffect, useState } from 'react';
import mockApi, { Video } from '@/lib/mock-api';
import VideoPlayer from '@/components/media/VideoPlayer';
import Link from 'next/link';

export default function TestPlayerPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVideos() {
      try {
        const data = await mockApi.getVideos();
        setVideos(data);
        if (data.length > 0) {
          setSelectedVideo(data[0]);
        }
        setLoading(false);
      } catch (err) {
        console.error('加载视频失败:', err);
        setError('加载视频失败，请刷新页面重试');
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  const handleSelectVideo = (video: Video) => {
    setSelectedVideo(video);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">加载中...</h2>
          <p className="text-gray-500">正在加载视频数据</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">出错了</h2>
          <p className="text-gray-700">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">视频播放器测试页面</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* 视频播放区域 */}
        <div className="w-full md:w-3/4">
          {selectedVideo ? (
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <VideoPlayer 
                videoSrc={selectedVideo.url} 
                posterSrc={selectedVideo.thumbnail}
                title={selectedVideo.title}
              />
              <div className="p-4 bg-white rounded-b-lg shadow">
                <h2 className="text-xl font-semibold mb-2">{selectedVideo.title}</h2>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="mr-3">{selectedVideo.views} 次观看</span>
                  <span>评分: {selectedVideo.rating}/5</span>
                </div>
                <p className="text-gray-700">{selectedVideo.description}</p>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500">未选择视频</p>
            </div>
          )}
        </div>

        {/* 视频列表 */}
        <div className="w-full md:w-1/4">
          <h3 className="text-lg font-semibold mb-4">推荐视频</h3>
          <div className="space-y-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className={`cursor-pointer p-3 rounded-md transition ${
                  selectedVideo?.id === video.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSelectVideo(video)}
              >
                <div className="relative pb-[56.25%] mb-2">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover rounded"
                  />
                  <span className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <h4 className="font-medium line-clamp-2">{video.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{video.views} 次观看</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-blue-600 hover:underline">
          返回首页
        </Link>
      </div>
    </div>
  );
}
