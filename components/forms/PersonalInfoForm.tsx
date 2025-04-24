import React, { useState } from 'react';
import { Form, Input, Select, Button, Checkbox, Modal } from 'antd';

const { Option } = Select;

export interface PersonalInfo {
  name: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  condition: string;
  phone: string;
  residence: string;
  education: string;
  handedness: 'left' | 'right';
  siblings: 'yes' | 'no';
  medicationHistory: 'yes' | 'no';
}

interface PersonalInfoFormProps {
  onSubmit: (info: PersonalInfo) => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ onSubmit }) => {
  const [form] = Form.useForm();
  const [consentChecked, setConsentChecked] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const handleSubmit = (values: PersonalInfo) => {
    if (consentChecked) {
      onSubmit(values);
    } else {
      Modal.error({
        title: '请同意实验条款',
        content: '您必须同意实验条款才能继续。',
      });
    }
  };

  const togglePrivacyPolicy = () => {
    setShowPrivacyPolicy(!showPrivacyPolicy);
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="gender" label="性别" rules={[{ required: true }]}>
        <Select>
          <Option value="male">男</Option>
          <Option value="female">女</Option>
          <Option value="other">其他</Option>
        </Select>
      </Form.Item>
      <Form.Item name="age" label="年龄" rules={[{ required: true, type: 'number', min: 0, max: 120 }]}>
        <Input type="number" />
      </Form.Item>
      <Form.Item name="condition" label="病症(如无请填无)" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="phone" label="电话号码" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="residence" label="居住地" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="education" label="学历" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="handedness" label="左/右利手" rules={[{ required: true }]}>
        <Select>
          <Option value="left">左利手</Option>
          <Option value="right">右利手</Option>
        </Select>
      </Form.Item>
      <Form.Item name="siblings" label="是否有亲兄弟姐妹" rules={[{ required: true }]}>
        <Select>
          <Option value="yes">是</Option>
          <Option value="no">否</Option>
        </Select>
      </Form.Item>
      <Form.Item name="medicationHistory" label="是否有服药史" rules={[{ required: true }]}>
        <Select>
          <Option value="yes">是</Option>
          <Option value="no">否</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Checkbox checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)}>
          我已阅读并同意<a onClick={togglePrivacyPolicy}>实验条款和隐私政策</a>
        </Checkbox>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" disabled={!consentChecked}>
          提交
        </Button>
      </Form.Item>

      <Modal
        title="隐私政策和实验同意书"
        open={showPrivacyPolicy}
        onOk={togglePrivacyPolicy}
        onCancel={togglePrivacyPolicy}
      >
        <p>
          本实验旨在研究抑郁症相关因素。您的参与是自愿的，您可以随时退出实验。
          我们将收集您的个人信息和实验数据，这些数据将被严格保密，仅用于研究目的。
          您的数据将以匿名方式存储和处理，不会泄露您的个人身份。
        </p>
        <p>
          如果您同意参与本实验，请勾选同意框。如有任何疑问，请联系研究人员。
        </p>
      </Modal>
    </Form>
  );
};

export default PersonalInfoForm;

