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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/experiments`, {
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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        开始实验
      </button>
    </form>
  );
}
