import React, { useState, useRef, useEffect } from 'react';
import { Button, Upload, message, Progress, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface TaskExperimentProps {
  onComplete: (result: any) => void;
}

export const TaskExperiment: React.FC<TaskExperimentProps> = ({ onComplete }) => {
  const [isExperimentRunning, setIsExperimentRunning] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videos = useRef<string[]>([]);
  const videoTimings = useRef<{ startTime: string; endTime: string }[]>([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      videos.current = await response.json();
      // 随机打乱视频顺序
      videos.current = videos.current.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const startExperiment = () => {
    setShowInstructions(false);
    setIsExperimentRunning(true);
    playNextVideo();
  };

  const playNextVideo = () => {
    if (currentVideoIndex < 5) {
      const startTime = new Date().toISOString();
      videoTimings.current.push({ startTime, endTime: '' });
      if (videoRef.current) {
        videoRef.current.src = videos.current[currentVideoIndex];
        videoRef.current.play();
      }
    } else {
      setIsExperimentRunning(false);
      setShowUploadDialog(true);
    }
  };

  const handleVideoEnd = () => {
    const endTime = new Date().toISOString();
    videoTimings.current[currentVideoIndex].endTime = endTime;
    setCurrentVideoIndex(prev => prev + 1);
    setTimeout(playNextVideo, 60000); // 等待1分钟后播放下一个视频
  };

  const handleUpload = async (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 文件上传成功`);
      try {
        const response = await fetch('/api/process-experiment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoTimings: videoTimings.current,
            eegFileUrl: info.file.response.url,
          }),
        });
        const result = await response.json();
        message.info(`实验结果: ${result.depressionLevel}`);
        onComplete(result);
      } catch (error) {
        console.error('Error processing experiment data:', error);
        message.error('处理实验数据时出错');
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 文件上传失败。`);
    }
  };

  return (
    <div>
      <Modal
        title="实验说明"
        visible={showInstructions}
        onOk={startExperiment}
        onCancel={() => {}}
        okText="开始实验"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <p>
          在这个实验中，您将观看5个短视频。每个视频之间有1分钟的休息时间。
          请集中注意力观看视频，并保持放松。实验结束后，您需要上传脑电数据文件。
        </p>
      </Modal>

      {isExperimentRunning && (
        <div>
          <video
            ref={videoRef}
            onEnded={handleVideoEnd}
            style={{ display: 'block', maxWidth: '100%' }}
          />
          <Progress percent={currentVideoIndex * 20} status="active" />
        </div>
      )}

      {showUploadDialog && (
        <Upload
          action="/api/upload-eeg"
          onChange={handleUpload}
        >
          <Button icon={<UploadOutlined />}>上传脑电数据文件</Button>
        </Upload>
      )}
    </div>
  );
};

