'use client';

import { useEffect, useRef, useState } from 'react';
import '../styles/theme.css';

interface VideoPlayerProps {
  video: {
    id: number;
    title: string;
    path: string;
  };
  experimentId: string | null;
  onVideoComplete: () => void;
}

export default function VideoPlayer({ video, experimentId, onVideoComplete }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setIsLoading(false);
    };

    const handleEnded = async () => {
      if (experimentId) {
        try {
          await fetch(`http://localhost:8080/api/experiments/${experimentId}/videos/${video.id}/complete`, {
            method: 'POST'
          });
        } catch (error) {
          console.error('Error completing video:', error);
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
  }, [video.id, experimentId, onVideoComplete]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-player-container page-transition">
      {isLoading && (
        <div className="loading-spinner" />
      )}
      <video
        ref={videoRef}
        src={`http://localhost:8080/api/videos/${video.id}/stream`}
        className="w-full rounded-lg shadow-lg"
        controls
      />
      
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm text-white p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={togglePlay}
            className="btn-primary"
          >
            {isPlaying ? '暂停' : '播放'}
          </button>
          <div className="text-sm font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
}
