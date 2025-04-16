import { describe, expect, test, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../utils/test-utils';

// 创建一个简单的视频播放器组件用于测试
function VideoPlayerBasic() {
  return (
    <div data-testid="video-player">
      <h1>视频播放器</h1>
      <div className="video-container">
        <video controls data-testid="video-element" />
      </div>
      <div className="controls">
        <button data-testid="play-button">播放</button>
        <button data-testid="pause-button">暂停</button>
      </div>
    </div>
  );
}

describe('视频播放器基础组件测试', () => {
  beforeEach(() => {
    render(<VideoPlayerBasic />);
  });

  test('应该正确渲染视频播放器组件', () => {
    expect(screen.getByTestId('video-player')).toBeInTheDocument();
    expect(screen.getByText('视频播放器')).toBeInTheDocument();
  });

  test('应该包含视频元素', () => {
    const videoElement = screen.getByTestId('video-element');
    expect(videoElement).toBeInTheDocument();
    expect(videoElement.tagName).toBe('VIDEO');
  });

  test('应该包含播放和暂停按钮', () => {
    expect(screen.getByTestId('play-button')).toBeInTheDocument();
    expect(screen.getByTestId('pause-button')).toBeInTheDocument();
  });
});
