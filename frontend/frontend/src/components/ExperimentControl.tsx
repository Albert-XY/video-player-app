'use client';

import { useState } from 'react';
import '../styles/theme.css';

interface ExperimentControlProps {
  onExperimentStart: (participantId: string) => void;
  experimentId: string | null;
}

export default function ExperimentControl({ onExperimentStart, experimentId }: ExperimentControlProps) {
  const [participantId, setParticipantId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantId.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId }),
      });

      if (response.ok) {
        const data = await response.json();
        onExperimentStart(data.id);
      }
    } catch (error) {
      console.error('Error starting experiment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (experimentId) {
    return (
      <div className="experiment-control-container page-transition">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-500 font-medium">实验进行中</span>
          <span className="text-gray-400">- 参与者ID: {experimentId}</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="experiment-control-container page-transition space-y-6">
      <div>
        <label htmlFor="participantId" className="block text-sm font-medium text-gray-300 mb-2">
          参与者ID
        </label>
        <input
          type="text"
          id="participantId"
          value={participantId}
          onChange={(e) => setParticipantId(e.target.value)}
          className="input-field w-full"
          placeholder="请输入您的参与者ID"
          required
        />
      </div>
      <button
        type="submit"
        className="btn-primary w-full flex items-center justify-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="loading-spinner mr-2" />
            <span>正在启动实验...</span>
          </>
        ) : (
          '开始实验'
        )}
      </button>
    </form>
  );
}
