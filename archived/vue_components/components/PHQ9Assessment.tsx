import React, { useState } from 'react';
import { Form, Radio, Button, Typography } from 'antd';

const { Title, Paragraph } = Typography;

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

interface PHQ9AssessmentProps {
  onSubmit: (score: number) => void;
}

export const PHQ9Assessment: React.FC<PHQ9AssessmentProps> = ({ onSubmit }) => {
  const [form] = Form.useForm();
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = (values: { [key: string]: number }) => {
    const totalScore = Object.values(values).reduce((sum, value) => sum + value, 0);
    setScore(totalScore);
    setShowResult(true);
    onSubmit(totalScore);
  };

  const getDepressionLevel = (score: number) => {
    if (score <= 4) return '无抑郁症状';
    if (score <= 9) return '轻度抑郁';
    if (score <= 14) return '中度抑郁';
    if (score <= 19) return '中重度抑郁';
    return '重度抑郁';
  };

  return (
    <div>
      <Title level={2}>PHQ-9 抑郁症筛查量表</Title>
      <Paragraph>
        在过去的两周里，您有多少次受到以下问题的困扰？
      </Paragraph>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        {questions.map((question, index) => (
          <Form.Item
            key={index}
            name={`q${index + 1}`}
            label={question}
            rules={[{ required: true, message: '请选择一个选项' }]}
          >
            <Radio.Group>
              <Radio value={0}>完全没有</Radio>
              <Radio value={1}>有几天</Radio>
              <Radio value={2}>一半以上时间</Radio>
              <Radio value={3}>几乎每天</Radio>
            </Radio.Group>
          </Form.Item>
        ))}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
      {showResult && (
        <div>
          <Title level={3}>评估结果</Title>
          <Paragraph>
            您的PHQ-9得分为：{score}分
          </Paragraph>
          <Paragraph>
            抑郁程度：{getDepressionLevel(score)}
          </Paragraph>
          <Paragraph>
            解释：
            <ul>
              <li>0-4分：无抑郁症状</li>
              <li>5-9分：轻度抑郁，建议观察</li>
              <li>10-14分：中度抑郁，建议进一步评估</li>
              <li>15-19分：中重度抑郁，建议寻求专业帮助</li>
              <li>20-27分：重度抑郁，强烈建议立即寻求专业帮助</li>
            </ul>
          </Paragraph>
          <Paragraph>
            请注意：这个评估结果仅供参考，不能替代专业医生的诊断。如果您对自己的心理健康状况有任何担忧，请咨询专业的心理健康工作者或医生。
          </Paragraph>
        </div>
      )}
    </div>
  );
};

