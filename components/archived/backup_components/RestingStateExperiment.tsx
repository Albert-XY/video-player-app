import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface RestingStateExperimentProps {
  onComplete: () => void;
}

export const RestingStateExperiment: React.FC<RestingStateExperimentProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'notStarted' | 'eyesClosed' | 'rest' | 'eyesOpen' | 'completed'>('notStarted');
  const [timeLeft, setTimeLeft] = useState(180);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<string | null>(null);
  const endTimeRef = useRef<string | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/path/to/beep-sound.mp3');
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startExperiment = () => {
    setStage('eyesClosed');
    startTimer();
    startTimeRef.current = new Date().toISOString();
  };

  const startTimer = () => {
    setTimeLeft(180);
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          audioRef.current?.play();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (timeLeft === 0) {
      switch (stage) {
        case 'eyesClosed':
          setStage('rest');
          setTimeout(() => {
            setStage('eyesOpen');
            startTimer();
          }, 60000);
          break;
        case 'eyesOpen':
          setStage('completed');
          endTimeRef.current = new Date().toISOString();
          break;
      }
    }
  }, [timeLeft, stage]);

  const handleUpload = async (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
      try {
        const response = await fetch('/api/process-resting-state', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startTime: startTimeRef.current,
            endTime: endTimeRef.current,
            eegFileUrl: info.file.response.url,
          }),
        });
        const result = await response.json();
        message.info(`实验结果: ${result.depressionLevel}`);
        onComplete();
      } catch (error) {
        console.error('Error processing experiment data:', error);
        message.error('处理实验数据时出错');
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  return (
    <div>
      {stage === 'notStarted' && (
        <Button onClick={startExperiment}>开始静息态实验</Button>
      )}
      {stage === 'eyesClosed' && (
        <div>
          <Title level={2}>请闭上眼睛</Title>
          <Text>剩余时间: {timeLeft} 秒</Text>
        </div>
      )}
      {stage === 'rest' && (
        <div>
          <Title level={2}>休息时间</Title>
          <Text>请保持放松，1分钟后将开始睁眼阶段</Text>
        </div>
      )}
      {stage === 'eyesOpen' && (
        <div>
          <Title level={2}>请睁开眼睛</Title>
          <Text>剩余时间: {timeLeft} 秒</Text>
        </div>
      )}
      {stage === 'completed' && (
        <div>
          <Title level={2}>实验已完成</Title>
          <Upload
            action="/api/upload-eeg"
            onChange={handleUpload}
          >
            <Button icon={<UploadOutlined />}>上传脑电数据文件</Button>
          </Upload>
        </div>
      )}
    </div>
  );
};

