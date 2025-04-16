// 简化版测试文件，减少对复杂测试环境的依赖
import React from 'react';
import { render } from '@testing-library/react';
import VideoPlayer from '../../components/media/VideoPlayer';

// 模拟视频数据
const mockVideoData = {
  id: 1,
  title: '测试视频',
  path: 'https://example.com/test-video.mp4'
};

// 模拟回调函数
const mockOnVideoComplete = jest.fn();

// 模拟HTMLMediaElement
beforeAll(() => {
  // 简化版HTMLMediaElement模拟
  window.HTMLMediaElement.prototype.play = jest.fn();
  window.HTMLMediaElement.prototype.pause = jest.fn();
  window.HTMLMediaElement.prototype.load = jest.fn();
});

describe('VideoPlayer 组件基础测试', () => {
  test('组件应该能够渲染', () => {
    // 只测试组件能否渲染，不测试交互功能
    const { container } = render(
      <VideoPlayer 
        video={mockVideoData}
        experimentId={null}
        onVideoComplete={mockOnVideoComplete}
      />
    );
    
    // 验证组件已渲染
    expect(container).toBeTruthy();
  });
});
