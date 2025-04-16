import React, { useState } from 'react';
import { Steps, Button, Modal } from 'antd';
import { PersonalInfoForm } from './PersonalInfoForm';
import { PHQ9Assessment } from './PHQ9Assessment';
import { TaskExperiment } from './TaskExperiment';
import { RestingStateExperiment } from './RestingStateExperiment';
import { SAMScale } from './SAMScale';
import { ResultsView } from './ResultsView';

const { Step } = Steps;

export const ExperimentHub: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [phq9Score, setPHQ9Score] = useState(null);
  const [taskExperimentResult, setTaskExperimentResult] = useState(null);
  const [restingStateResult, setRestingStateResult] = useState(null);
  const [samRating, setSamRating] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const steps = [
    { title: '个人信息', content: <PersonalInfoForm onSubmit={handlePersonalInfoSubmit} /> },
    { title: 'PHQ-9评估', content: <PHQ9Assessment onSubmit={handlePHQ9Submit} /> },
    { title: '任务态实验', content: <TaskExperiment onComplete={handleTaskExperimentComplete} /> },
    { title: '静息态实验', content: <RestingStateExperiment onComplete={handleRestingStateComplete} /> },
    { title: 'SAM量表', content: <SAMScale onSubmit={handleSAMSubmit} /> },
  ];

  function handlePersonalInfoSubmit(info) {
    setPersonalInfo(info);
    setCurrentStep(1);
  }

  function handlePHQ9Submit(score) {
    setPHQ9Score(score);
    setCurrentStep(2);
  }

  function handleTaskExperimentComplete(result) {
    setTaskExperimentResult(result);
    setCurrentStep(3);
  }

  function handleRestingStateComplete(result) {
    setRestingStateResult(result);
    setCurrentStep(4);
  }

  function handleSAMSubmit(rating) {
    setSamRating(rating);
    setShowResults(true);
  }

  function handleViewResults() {
    setShowResults(true);
  }

  function handleCloseResults() {
    setShowResults(false);
  }

  return (
    <div>
      <Steps current={currentStep}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div className="steps-content">{steps[currentStep].content}</div>
      {currentStep === steps.length - 1 && (
        <Button onClick={handleViewResults}>查看结果</Button>
      )}
      <Modal
        title="实验结果"
        visible={showResults}
        onCancel={handleCloseResults}
        footer={null}
        width={800}
      >
        <ResultsView
          personalInfo={personalInfo}
          phq9Score={phq9Score}
          taskExperimentResult={taskExperimentResult}
          restingStateResult={restingStateResult}
          samRating={samRating}
        />
      </Modal>
    </div>
  );
};

