// Vitest设置文件 - 替代Jest设置
import '@testing-library/jest-dom';

// 设置环境变量
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';

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
  eventListeners: Record<string, Function[]> = {};

  play() {
    this.paused = false;
    this.triggerEvent('play');
    return this.playPromise;
  }

  pause() {
    this.paused = true;
    this.triggerEvent('pause');
  }

  addEventListener(event: string, callback: Function) {
    this.eventListeners[event] = this.eventListeners[event] || [];
    this.eventListeners[event].push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
  }

  triggerEvent(event: string, data: Record<string, any> = {}) {
    if (!this.eventListeners[event]) return;
    const eventObj = { ...data, target: this };
    this.eventListeners[event].forEach(cb => cb(eventObj));
  }

  load() {
    this.readyState = 4; // HAVE_ENOUGH_DATA
    this.triggerEvent('loadeddata');
    this.triggerEvent('canplay');
  }
}

// 应用到全局
window.HTMLMediaElement = MockHTMLMediaElement as any;
window.HTMLVideoElement = MockHTMLMediaElement as any;
window.HTMLAudioElement = MockHTMLMediaElement as any;

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
  value: vi.fn().mockImplementation(query => ({
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
  
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
}

window.IntersectionObserver = MockIntersectionObserver as any;

// 模拟fetch
global.fetch = vi.fn();

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
