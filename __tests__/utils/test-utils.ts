import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// 提供标准的测试工具函数
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
