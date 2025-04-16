'use client';

import { useState } from 'react';

interface PHQ9AssessmentProps {
  onSubmit: (score: number, answers: number[]) => void;
}

export default function PHQ9Assessment({ onSubmit }: PHQ9AssessmentProps) {
  const [answers, setAnswers] = useState<number[]>(Array(9).fill(-1));
  const [showError, setShowError] = useState(false);

  const questions = [
    '做事时提不起劲或没有兴趣',
    '感到心情低落、沮丧或绝望',
    '入睡困难、睡不安稳或睡眠过多',
    '感觉疲倦或没有活力',
    '食欲不振或吃太多',
    '觉得自己很糟或觉得自己很失败，或让自己或家人失望',
    '无法集中精神做事，例如看报纸或看电视',
    '行动或说话速度变得很慢，慢到别人已经察觉。或正好相反，变得比平常更烦躁或坐立不安',
    '有不如死掉或用某种方式伤害自己的念头'
  ];

  const handleOptionSelect = (questionIndex: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
    setShowError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 检查是否所有问题都已回答
    if (answers.some(answer => answer === -1)) {
      setShowError(true);
      return;
    }
    
    // 计算总分
    const totalScore = answers.reduce((sum, value) => sum + value, 0);
    
    // 提交结果
    onSubmit(totalScore, answers);
  };

  const getDepressionLevel = (score: number) => {
    if (score <= 4) return '无抑郁症状';
    if (score <= 9) return '轻度抑郁';
    if (score <= 14) return '中度抑郁';
    if (score <= 19) return '中重度抑郁';
    return '重度抑郁';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">PHQ-9 抑郁症筛查量表</h2>
      <p className="mb-4 text-gray-600">
        在过去的两周里，您有多少次受到以下问题的困扰？
      </p>
      
      {showError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          请回答所有问题后再提交。
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <div key={index} className="mb-6">
            <p className="mb-2 font-medium">{index + 1}. {question}</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {[
                { label: '完全没有', value: 0 },
                { label: '有几天', value: 1 },
                { label: '一半以上时间', value: 2 },
                { label: '几乎每天', value: 3 }
              ].map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    id={`q${index}-${option.value}`}
                    name={`question-${index}`}
                    checked={answers[index] === option.value}
                    onChange={() => handleOptionSelect(index, option.value)}
                    className="mr-2"
                  />
                  <label htmlFor={`q${index}-${option.value}`}>{option.label}</label>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <button 
          type="submit" 
          className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          提交评估
        </button>
      </form>
    </div>
  );
}
