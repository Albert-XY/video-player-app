'use client';

import { useState } from 'react';

interface ExperimentControlProps {
  onExperimentStart: (participantId: string) => void;
  experimentId: string | null;
}

export default function ExperimentControl({ onExperimentStart, experimentId }: ExperimentControlProps) {
  const [participantId, setParticipantId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantId.trim()) return;

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
    }
  };

  if (experimentId) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
        实验进行中 - 参与者ID: {experimentId}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="participantId" className="block text-sm font-medium text-gray-700">
          参与者ID
        </label>
        <input
          type="text"
          id="participantId"
          value={participantId}
          onChange={(e) => setParticipantId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="请输入您的参与者ID"
          required
        />
      </div>
      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        开始实验
      </button>
    </form>
  );
}
