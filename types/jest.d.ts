// 测试框架类型声明
/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R;
  toHaveAttribute(attr: string, value?: string): R;
  toBeVisible(): R;
  toHaveTextContent(text: string | RegExp): R;
  toHaveClass(className: string): R;
  toHaveStyle(style: Record<string, unknown>): R;
}

declare global {
  namespace jest {
    interface Matchers<R> extends CustomMatchers<R> {}
  }
}
