import React, { useState } from 'react';
import { Slider, Button, message } from 'antd';

export const SAMScale: React.FC = () => {
  const [valence, setValence] = useState(5);
  const [arousal, setArousal] = useState(5);

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/submit-sam-rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ valence, arousal }),
      });
      if (response.ok) {
        message.success('SAM评分提交成功');
      } else {
        message.error('SAM评分提交失败');
      }
    } catch (error) {
      console.error('Error submitting SAM rating:', error);
      message.error('提交SAM评分时出错');
    }
  };

  return (
    <div>
      <h2>SAM量表评估</h2>
      <div>
        <h3>效价 (Valence)</h3>
        <Slider
          min={1}
          max={9}
          value={valence}
          onChange={setValence}
        />
      </div>
      <div>
        <h3>唤醒度 (Arousal)</h3>
        <Slider
          min={1}
          max={9}
          value={arousal}
          onChange={setArousal}
        />
      </div>
      <Button onClick={handleSubmit}>提交评分</Button>
    </div>
  );
};

