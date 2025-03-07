'use client';

import React from 'react';

interface UploadProps {
  action: string;
  onSuccess: (info: any) => void;
  onError: () => void;
}

const Upload = ({ action, onSuccess, onError }: UploadProps) => {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(action, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        onSuccess({ response: data });
      } else {
        onError();
      }
    } catch (error) {
      console.error('Upload error:', error);
      onError();
    }
  };
  
  return (
    <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
      <div className="mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </div>
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">将文件拖到此处，或<span className="text-blue-500">点击上传</span></p>
        <p className="text-xs text-gray-400 mt-1">支持单个或批量上传</p>
      </div>
      <input
        type="file"
        onChange={handleUpload}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
      >
        选择文件
      </label>
    </div>
  );
};

export { Upload };
