'use client';

import { useState } from 'react';
import Layout from '../components/Layout';
import VideoPlayer from '../components/VideoPlayer';
import ExperimentControl from '../components/ExperimentControl';

export default function Home() {
  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const videos = [
    {
      id: 1,
      title: '视频 1',
      path: '/videos/video1.mp4'
    },
    {
      id: 2,
      title: '视频 2',
      path: '/videos/video2.mp4'
    },
    {
      id: 3,
      title: '视频 3',
      path: '/videos/video3.mp4'
    }
  ];

  const handleExperimentStart = (id: string) => {
    setExperimentId(id);
  };

  const handleVideoComplete = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          脑机接口实验平台
        </h1>
        
        <ExperimentControl
          onExperimentStart={handleExperimentStart}
          experimentId={experimentId}
        />

        {experimentId && (
          <VideoPlayer
            video={videos[currentVideoIndex]}
            experimentId={experimentId}
            onVideoComplete={handleVideoComplete}
          />
        )}
      </div>
    </Layout>
  );
} 