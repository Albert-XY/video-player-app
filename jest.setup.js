// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// 设置环境变量
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';

// 修复 fetch 未定义问题
global.fetch = jest.fn();

// 模拟 localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

// 完整模拟 HTMLMediaElement
class MockHTMLMediaElement {
  constructor() {
    this.volume = 1;
    this.currentTime = 0;
    this.paused = true;
    this.muted = false;
    this.src = '';
    this.playbackRate = 1;
    this.duration = 0;
    this.readyState = 0;
    this.playPromise = Promise.resolve();
    this.eventListeners = {};
  }

  play() {
    this.paused = false;
    this.triggerEvent('play');
    return this.playPromise;
  }

  pause() {
    this.paused = true;
    this.triggerEvent('pause');
  }

  addEventListener(event, callback) {
    this.eventListeners[event] = this.eventListeners[event] || [];
    this.eventListeners[event].push(callback);
  }

  removeEventListener(event, callback) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
  }

  triggerEvent(event, data = {}) {
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
window.HTMLMediaElement = MockHTMLMediaElement;
window.HTMLVideoElement = MockHTMLMediaElement;
window.HTMLAudioElement = MockHTMLMediaElement;

// 模拟window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 模拟IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
}

window.IntersectionObserver = MockIntersectionObserver;

// 扩展expect方法，添加对视频元素的断言
expect.extend({
  toBeVideoElement(received) {
    const pass = received instanceof HTMLVideoElement;
    return {
      message: () => `expected ${received} to be a video element`,
      pass,
    };
  },
});

// 模拟next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {},
  }),
}));

// 模拟next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));
