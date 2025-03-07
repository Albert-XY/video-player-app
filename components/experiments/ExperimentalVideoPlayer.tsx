'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Dialog, Upload } from '@/components/ui';

interface Video {
  id: string;
  title: string;
  src: string;
}

export default function ExperimentalVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isExperimentRunning, setIsExperimentRunning] = useState(false);
  const [isExperimentComplete, setIsExperimentComplete] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [experimentResult, setExperimentResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/experiment-videos');
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const startExperiment = () => {
    setIsExperimentRunning(true);
    playVideo();
  };

  const exitExperiment = () => {
    setIsExperimentRunning(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const playNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
      setTimeout(() => playVideo(), 100);
    } else {
      setShowUploadDialog(true);
    }
  };

  const handleVideoEnd = () => {
    playNextVideo();
  };

  const handleUploadSuccess = async (info: any) => {
    setShowUploadDialog(false);
    setIsLoading(true);
    
    try {
      await sendExperimentData(info.response.url);
    } catch (error) {
      console.error('Error sending experiment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadError = () => {
    console.error('Upload failed');
  };

  const sendExperimentData = async (eegFileUrl: string) => {
    try {
      const response = await fetch('/api/process-experiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videos: videos.map(v => v.id),
          eegFile: eegFileUrl
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setExperimentResult(JSON.stringify(result, null, 2));
        setShowResultDialog(true);
      }
    } catch (error) {
      console.error('Error processing experiment:', error);
    }
  };

  const finishExperiment = () => {
    setShowResultDialog(false);
    setIsExperimentRunning(false);
    setIsExperimentComplete(true);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {videos.length > 0 && (
        <video
          ref={videoRef}
          src={videos[currentVideoIndex]?.src}
          className={`w-full max-w-3xl aspect-video ${!isExperimentRunning ? 'hidden' : ''}`}
          onEnded={handleVideoEnd}
        />
      )}
      
      {!isExperimentRunning && !isExperimentComplete && (
        <div className="controls">
          <Button onClick={startExperiment} variant="default">开始实验</Button>
        </div>
      )}
      
      {isExperimentRunning && (
        <div className="controls">
          <Button onClick={exitExperiment} variant="destructive">退出实验</Button>
        </div>
      )}
      
      {showUploadDialog && (
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <div className="p-6">
            <h2 className="text-lg font-bold mb-4">上传脑电数据</h2>
            <Upload
              action="/api/upload-eeg"
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
            />
          </div>
        </Dialog>
      )}
      
      {showResultDialog && (
        <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
          <div className="p-6">
            <h2 className="text-lg font-bold mb-4">实验结果</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {experimentResult}
            </pre>
            <div className="mt-4 flex justify-end">
              <Button onClick={finishExperiment}>完成</Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
