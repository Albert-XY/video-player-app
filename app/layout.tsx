/**
 * 应用根布局组件 - 所有页面共享的顶层布局
 * 强制约定：必须包含 <html> 和 <body> 标签
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
 */

// 使用 Next.js 优化的字体加载方法
import { Inter } from 'next/font/google'

// 导入全局样式（需放置在布局文件中）
import './globals.css'

// 配置 Inter 字体优化参数
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '600', '700'],
})

// 元数据配置保持不变（移除字体相关配置）
export const metadata = {
  title: {
    default: 'Video Player App',
    template: '%s | Video Player App',
  },
  description: '专业视频播放解决方案，支持多种格式和流媒体协议',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Video Player App',
    description: '专业视频播放解决方案，支持多种格式和流媒体协议',
    type: 'website',
  }
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <meta name="theme-color" content="#000000" />
      </head>
      
      <body className="min-h-screen antialiased bg-background">
        {children}
      </body>
    </html>
  )
}