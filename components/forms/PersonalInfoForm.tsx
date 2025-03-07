'use client';

import { useState } from 'react';

export interface PersonalInfo {
  name: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  phone: string;
  handedness: 'left' | 'right';
  email?: string;
  address?: string;
  education?: string;
}

interface PersonalInfoFormProps {
  onSubmit: (info: PersonalInfo) => void;
}

export default function PersonalInfoForm({ onSubmit }: PersonalInfoFormProps) {
  const [formData, setFormData] = useState<Partial<PersonalInfo>>({
    gender: 'male',
    handedness: 'right'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // 清除该字段的错误
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // 姓名验证
    if (!formData.name?.trim()) {
      newErrors.name = '请输入姓名';
    }
    
    // 年龄验证
    if (!formData.age) {
      newErrors.age = '请输入年龄';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 18 || Number(formData.age) > 120) {
      newErrors.age = '请输入有效的年龄（18-120）';
    }
    
    // 电话验证
    if (!formData.phone?.trim()) {
      newErrors.phone = '请输入电话号码';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号码';
    }
    
    // 同意条款
    if (!consentChecked) {
      newErrors.consent = '您必须同意实验条款才能继续';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData as PersonalInfo);
    }
  };

  const togglePrivacyPolicy = () => {
    setShowPrivacyPolicy(!showPrivacyPolicy);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">个人信息</h2>
      <p className="mb-4 text-gray-600">
        请填写您的个人信息，以便我们更好地了解您的情况。
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1 font-medium">
            姓名 <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="gender" className="block mb-1 font-medium">
            性别 <span className="text-red-600">*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender || 'male'}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="age" className="block mb-1 font-medium">
            年龄 <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age || ''}
            onChange={handleChange}
            min="18"
            max="120"
            className={`w-full p-2 border rounded-md ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="phone" className="block mb-1 font-medium">
            联系电话 <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            placeholder="请输入11位手机号码"
            className={`w-full p-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="handedness" className="block mb-1 font-medium">
            左/右利手 <span className="text-red-600">*</span>
          </label>
          <select
            id="handedness"
            name="handedness"
            value={formData.handedness || 'right'}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="left">左利手</option>
            <option value="right">右利手</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 font-medium">
            电子邮箱
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="education" className="block mb-1 font-medium">
            学历
          </label>
          <input
            type="text"
            id="education"
            name="education"
            value={formData.education || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="address" className="block mb-1 font-medium">
            住址
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="consent"
              checked={consentChecked}
              onChange={() => setConsentChecked(!consentChecked)}
              className="mr-2"
            />
            <label htmlFor="consent">
              我已阅读并同意
              <button 
                type="button" 
                onClick={togglePrivacyPolicy}
                className="text-indigo-600 hover:underline ml-1"
              >
                实验条款和隐私政策
              </button>
            </label>
          </div>
          {errors.consent && <p className="mt-1 text-sm text-red-600">{errors.consent}</p>}
        </div>
        
        <button 
          type="submit" 
          className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          提交信息
        </button>
      </form>
      
      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">隐私政策和实验同意书</h3>
            <div className="mb-4">
              <p className="mb-2">
                本实验旨在研究视频观看体验和情绪反应。您的参与是自愿的，您可以随时退出实验。
              </p>
              <p className="mb-2">
                我们将收集您的个人信息和实验数据，这些数据将被严格保密，仅用于研究目的。
                您的数据将以匿名方式存储和处理，不会泄露您的个人身份。
              </p>
              <p>
                如果您同意参与本实验，请勾选同意框。如有任何疑问，请联系研究人员。
              </p>
            </div>
            <button
              type="button"
              onClick={togglePrivacyPolicy}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
