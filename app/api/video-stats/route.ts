import { NextResponse } from 'next/server'

// API服务器地址
const API_BASE_URL = 'http://localhost:8080';

// 获取视频筛选状态统计信息
export async function GET() {
  try {
    // 转发请求到测试API服务器
    const response = await fetch(`${API_BASE_URL}/api/video-stats`);
    const data = await response.json();
    const status = response.status;

    return NextResponse.json(data, { status });
  } catch (error) {
    console.error('Error fetching video stats:', error)
    return NextResponse.json({ error: '获取视频统计信息失败' }, { status: 500 })
  }
}
