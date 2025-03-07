import React from 'react';
import { Typography, Descriptions, Card } from 'antd';

const { Title, Paragraph } = Typography;

interface ResultsViewProps {
  personalInfo: any;
  phq9Score: number;
  taskExperimentResult: any;
  restingStateResult: any;
  samRating: { valence: number; arousal: number };
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  personalInfo,
  phq9Score,
  taskExperimentResult,
  restingStateResult,
  samRating
}) => {
  const getPHQ9Level = (score: number) => {
    if (score <= 4) return '无抑郁症状';
    if (score <= 9) return '轻度抑郁';
    if (score <= 14) return '中度抑郁';
    if (score <= 19) return '中重度抑郁';
    return '重度抑郁';
  };

  return (
    <div>
      <Title level={2}>实验结果摘要</Title>
      
      <Card title="个人信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="姓名">{personalInfo.name}</Descriptions.Item>
          <Descriptions.Item label="年龄">{personalInfo.age}</Descriptions.Item>
          <Descriptions.Item label="性别">{personalInfo.gender}</Descriptions.Item>
          <Descriptions.Item label="病症">{personalInfo.condition}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="PHQ-9评估" style={{ marginBottom: 16 }}>
        <Paragraph>
          得分：{phq9Score}
          <br />
          评估结果：{getPHQ9Level(phq9Score)}
        </Paragraph>
      </Card>

      <Card title="任务态实验" style={{ marginBottom: 16 }}>
        <Paragraph>
          抑郁等级：{taskExperimentResult?.depressionLevel}
        </Paragraph>
      </Card>

      <Card title="静息态实验" style={{ marginBottom: 16 }}>
        <Paragraph>
          抑郁等级：{restingStateResult?.depressionLevel}
        </Paragraph>
      </Card>

      <Card title="SAM量表评估">
        <Descriptions column={2}>
          <Descriptions.Item label="效价 (Valence)">{samRating.valence}</Descriptions.Item>
          <Descriptions.Item label="唤醒度 (Arousal)">{samRating.arousal}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

