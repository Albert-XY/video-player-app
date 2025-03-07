import { NextResponse } from 'next/server'

// API服务器地址
const API_BASE_URL = 'http://localhost:8080';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('SAM评分请求:', body);

    // 转发请求到测试API服务器
    const response = await fetch(`${API_BASE_URL}/api/sam-ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    const status = response.status;

    return NextResponse.json(data, { status });
  } catch (error) {
    console.error('Error submitting SAM rating:', error)
    return NextResponse.json({ error: '提交评分失败' }, { status: 500 })
  }
}
