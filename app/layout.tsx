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
  subsets: ['latin'], // 仅加载拉丁字符集（体积减少~90%）
  display: 'swap', // 字体加载时使用系统字体过渡（避免布局偏移）
  variable: '--font-inter', // 定义 CSS 变量供全局使用
  weight: ['400', '600', '700'], // 按需加载字体字重（减少不必要的体积）
})

// 基础元数据配置（可被子页面覆盖）
export const metadata = {
  title: {
    default: 'Video Player App', // 默认标题
    template: '%s | Video Player App', // 子页面标题模板（例如："About - Video Player App"）
  },
  description: '专业视频播放解决方案，支持多种格式和流媒体协议',
  robots: {
    index: true, // 允许搜索引擎索引
    follow: true, // 跟踪页面链接
  },
  openGraph: { // 增强社交媒体分享预览
    title: 'Video Player App',
    description: '专业视频播放解决方案，支持多种格式和流媒体协议',
    type: 'website',
  }
}

// 类型定义增强
interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="zh-CN" // 正确的中文语言标识
      className={`${inter.variable}`} // 应用字体 CSS 变量
      suppressHydrationWarning // 禁用 React 18 水合警告
    >
      {/*
        Head 增强配置（默认会注入 metadata 内容）
        手动添加需要预加载的关键资源
      */}
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* 动态主题色支持（示例） */}
        <meta name="theme-color" content="#000000" />
      </head>
      
      <body className="min-h-screen antialiased bg-background">
        {/*
          Next.js 页面内容注入点
          min-h-screen: 确保内容至少撑满全屏
          antialiased: 启用字体抗锯齿
          bg-background: 使用 CSS 变量定义背景色（需在 globals.css 中定义）
        */}
        {children}
      </body>
    </html>
  )
}