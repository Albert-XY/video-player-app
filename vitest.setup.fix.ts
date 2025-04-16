/// <reference types="vitest" />
import '@testing-library/jest-dom';
import { vi, beforeAll } from 'vitest';

// 设置环境变量
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';

// 类型声明
interface EventListener {
  (evt: any): void;
}

// 模拟HTMLMediaElement
class MockHTMLMediaElement {
  volume = 1;
  currentTime = 0;
  paused = true;
  muted = false;
  src = '';
  playbackRate = 1;
  duration = 0;
  readyState = 0;
  playPromise = Promise.resolve();
  eventListeners: Record<string, EventListener[]> = {};

  play(): Promise<void> {
    this.paused = false;
    this.triggerEvent('play');
    return this.playPromise;
  }

  pause(): void {
    this.paused = true;
    this.triggerEvent('pause');
  }

  addEventListener(event: string, callback: EventListener): void {
    this.eventListeners[event] = this.eventListeners[event] || [];
    this.eventListeners[event].push(callback);
  }

  removeEventListener(event: string, callback: EventListener): void {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
  }

  triggerEvent(event: string, data: Record<string, any> = {}): void {
    if (!this.eventListeners[event]) return;
    const eventObj = { ...data, target: this };
    this.eventListeners[event].forEach(cb => cb(eventObj));
  }

  load(): void {
    this.readyState = 4; // HAVE_ENOUGH_DATA
    this.triggerEvent('loadeddata');
    this.triggerEvent('canplay');
  }
}

beforeAll(() => {
  // 应用到全局
  (window as any).HTMLMediaElement = MockHTMLMediaElement;
  (window as any).HTMLVideoElement = MockHTMLMediaElement;
  (window as any).HTMLAudioElement = MockHTMLMediaElement;

  // 模拟localStorage
  const localStorageMock = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };

  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  // 模拟sessionStorage
  Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });

  // 模拟matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // 模拟IntersectionObserver
  class MockIntersectionObserver {
    callback: Function;
    
    constructor(callback: Function) {
      this.callback = callback;
    }
    
    observe(): null { return null; }
    unobserve(): null { return null; }
    disconnect(): null { return null; }
  }

  (window as any).IntersectionObserver = MockIntersectionObserver;

  // 模拟fetch
  (global as any).fetch = vi.fn();
});

// 模拟next/navigation
vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
  };
});
