'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  video: {
    id: number;
    title: string;
    path: string;
  };
  experimentId: string | null;
  onVideoComplete: () => void;
  disableControls?: boolean;
}

export default function VideoPlayer({ video, experimentId, onVideoComplete, disableControls = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      if (disableControls && experimentId) {
        videoElement.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.error('自动播放失败:', err));
      }
    };

    const handleEnded = async () => {
      if (experimentId) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/experiments/${experimentId}/videos/${video.id}/complete`, {
            method: 'POST'
          });
        } catch (error) {
          console.error('记录视频完成时出错:', error);
        }
      }
      onVideoComplete();
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [video, experimentId, onVideoComplete, disableControls]);

  const togglePlay = () => {
    if (disableControls) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }

    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col">
      <div className="relative aspect-video bg-black rounded-md overflow-hidden">
        <video
          ref={videoRef}
          src={video.path}
          className="w-full h-full"
          onClick={togglePlay}
          controls={false}
          onError={(e) => console.error('视频加载错误:', e)}
          crossOrigin="anonymous"
          playsInline
        />
        {!disableControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white px-4 py-2">
            <div className="flex items-center space-x-2">
              <button className="focus:outline-none" onClick={togglePlay}>
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
              <div className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              <div className="flex-1 mx-2">
                <div className="h-1 w-full bg-gray-400 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        {disableControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              <div className="flex-1 mx-2">
                <div className="h-1 w-full bg-gray-400 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <h3 className="text-lg font-medium mt-2">{video.title}</h3>
      {disableControls && experimentId && (
        <p className="text-sm text-red-600 mt-1">实验模式：禁止暂停或跳过视频</p>
      )}
    </div>
  );
}
