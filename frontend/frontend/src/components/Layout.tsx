'use client';

import { ReactNode } from 'react';
import BrainModel from './BrainModel';
import '../styles/theme.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen relative">
      {/* 背景层 */}
      <div className="brain-wave-background">
        <div className="brain-wave" />
      </div>

      {/* 3D模型层 */}
      <BrainModel />

      {/* 内容层 */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
} 