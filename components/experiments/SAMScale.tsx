'use client';

import React, { useState } from 'react'

interface SAMScaleProps {
  onSubmit?: (valence: number, arousal: number) => void;
  directSubmit?: boolean; // 是否直接提交到 API
}

// 导出S对象，确保它可以通过SAMScale.S访问
export const S = { valence: 5, arousal: 5 };

export default function SAMScale({ onSubmit, directSubmit = false }: SAMScaleProps) {
  const [valence, setValence] = useState<number>(5)
  const [arousal, setArousal] = useState<number>(5)
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (directSubmit) {
      try {
        setSubmitting(true);
        const response = await fetch('/api/submit-sam-rating', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ valence, arousal }),
        });
        
        if (response.ok) {
          setMessage({ text: 'SAM评分提交成功', type: 'success' });
          // 重置表单
          setValence(5);
          setArousal(5);
        } else {
          setMessage({ text: 'SAM评分提交失败', type: 'error' });
        }
      } catch (error) {
        console.error('Error submitting SAM rating:', error);
        setMessage({ text: '提交SAM评分时出错', type: 'error' });
      } finally {
        setSubmitting(false);
      }
    } else if (onSubmit) {
      onSubmit(valence, arousal);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">SAM量表评估</h2>
      
      {message && (
        <div className={`p-2 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">效价 (Valence)</label>
        <input
          type="range"
          min="1"
          max="9"
          value={valence}
          onChange={(e) => setValence(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>消极 (1)</span>
          <span>中性 (5)</span>
          <span>积极 (9)</span>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">唤醒度 (Arousal)</label>
        <input
          type="range"
          min="1"
          max="9"
          value={arousal}
          onChange={(e) => setArousal(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>平静 (1)</span>
          <span>中等 (5)</span>
          <span>兴奋 (9)</span>
        </div>
      </div>
      
      <button
        type="submit"
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        disabled={submitting}
      >
        {submitting ? '提交中...' : '提交评分'}
      </button>
    </form>
  )
}
