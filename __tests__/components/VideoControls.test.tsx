import { describe, expect, test, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../utils/test-utils';

// 创建一个视频控制栏组件用于测试
interface VideoControlsProps {
  onPlay: () => void;
  onPause: () => void;
  onVolumeChange: (value: number) => void;
  onSeek: (time: number) => void;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
}

function VideoControls({
  onPlay,
  onPause,
  onVolumeChange,
  onSeek,
  isPlaying,
  volume,
  currentTime,
  duration
}: VideoControlsProps) {
  return (
    <div data-testid="video-controls" className="video-controls">
      <button 
        data-testid="play-button"
        onClick={isPlaying ? onPause : onPlay}
      >
        {isPlaying ? '暂停' : '播放'}
      </button>
      
      <div data-testid="progress-bar" className="progress-bar">
        <input 
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          data-testid="progress-input"
        />
        <span data-testid="time-display">
          {Math.floor(currentTime)}/{Math.floor(duration)}
        </span>
      </div>
      
      <div data-testid="volume-control" className="volume-control">
        <input 
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          data-testid="volume-input"
        />
      </div>
    </div>
  );
}

describe('视频控制栏组件测试', () => {
  const mockProps = {
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onVolumeChange: vi.fn(),
    onSeek: vi.fn(),
    isPlaying: false,
    volume: 0.5,
    currentTime: 30,
    duration: 120
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // 在每个测试前清除渲染
    document.body.innerHTML = '';
  });

  test('应该正确渲染视频控制栏', () => {
    render(<VideoControls {...mockProps} />);
    expect(screen.getByTestId('video-controls')).toBeInTheDocument();
    expect(screen.getByTestId('play-button')).toBeInTheDocument();
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    expect(screen.getByTestId('volume-control')).toBeInTheDocument();
  });

  test('播放/暂停按钮应该根据状态显示正确文本', () => {
    // 初始状态为未播放
    const { unmount } = render(<VideoControls {...mockProps} />);
    expect(screen.getByTestId('play-button')).toHaveTextContent('播放');
    
    // 先清除之前的渲染
    unmount();
    
    // 改变为播放状态
    render(<VideoControls {...mockProps} isPlaying={true} />);
    expect(screen.getByTestId('play-button')).toHaveTextContent('暂停');
  });

  test('点击播放按钮应该触发正确的回调', () => {
    const { unmount } = render(<VideoControls {...mockProps} />);
    fireEvent.click(screen.getByTestId('play-button'));
    expect(mockProps.onPlay).toHaveBeenCalledTimes(1);
    
    // 先清除之前的渲染
    unmount();
    
    // 改变为播放状态
    render(<VideoControls {...mockProps} isPlaying={true} />);
    fireEvent.click(screen.getByTestId('play-button'));
    expect(mockProps.onPause).toHaveBeenCalledTimes(1);
  });

  test('调整音量应该触发音量变化回调', () => {
    render(<VideoControls {...mockProps} />);
    fireEvent.change(screen.getByTestId('volume-input'), { target: { value: '0.8' } });
    expect(mockProps.onVolumeChange).toHaveBeenCalledWith(0.8);
  });

  test('调整进度条应该触发seek回调', () => {
    render(<VideoControls {...mockProps} />);
    fireEvent.change(screen.getByTestId('progress-input'), { target: { value: '60' } });
    expect(mockProps.onSeek).toHaveBeenCalledWith(60);
  });

  test('时间显示应该正确格式化', () => {
    const { unmount } = render(<VideoControls {...mockProps} />);
    expect(screen.getByTestId('time-display')).toHaveTextContent('30/120');
    
    // 先清除之前的渲染
    unmount();
    
    // 更改时间
    render(<VideoControls {...mockProps} currentTime={45} duration={90} />);
    expect(screen.getByTestId('time-display')).toHaveTextContent('45/90');
  });
});
