'use client';

import { useState } from 'react';
import PersonalInfoForm, { PersonalInfo } from '../forms/PersonalInfoForm';
import PHQ9Assessment from '../forms/assessment/PHQ9Assessment';

interface ExperimentSetupProps {
  onComplete: (experimentData: {
    personalInfo: PersonalInfo;
    phq9Score: number;
    phq9Answers: number[];
  }) => void;
}

export default function ExperimentSetup({ onComplete }: ExperimentSetupProps) {
  const [step, setStep] = useState<'info' | 'phq9'>('info');
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [phq9Score, setPhq9Score] = useState<number | null>(null);
  const [phq9Answers, setPhq9Answers] = useState<number[]>([]);

  const handlePersonalInfoSubmit = (info: PersonalInfo) => {
    setPersonalInfo(info);
    setStep('phq9');
  };

  const handlePhq9Submit = (score: number, answers: number[]) => {
    setPhq9Score(score);
    setPhq9Answers(answers);
    
    if (personalInfo) {
      onComplete({
        personalInfo,
        phq9Score: score,
        phq9Answers: answers
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'info' ? 'bg-indigo-600 text-white' : 'bg-indigo-200'
          }`}>
            1
          </div>
          <div className="h-1 w-16 mx-2 bg-gray-200">
            <div className={`h-full ${step === 'info' ? 'w-0' : 'w-full'} bg-indigo-600 transition-all duration-300`}></div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'phq9' ? 'bg-indigo-600 text-white' : 'bg-indigo-200'
          }`}>
            2
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <div className={step === 'info' ? 'font-semibold text-indigo-600' : ''}>个人信息</div>
          <div className={step === 'phq9' ? 'font-semibold text-indigo-600' : ''}>PHQ-9量表</div>
        </div>
      </div>

      {step === 'info' && (
        <PersonalInfoForm onSubmit={handlePersonalInfoSubmit} />
      )}

      {step === 'phq9' && (
        <div>
          <PHQ9Assessment onSubmit={handlePhq9Submit} />
          <button
            onClick={() => setStep('info')}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            返回上一步
          </button>
        </div>
      )}
    </div>
  );
}
