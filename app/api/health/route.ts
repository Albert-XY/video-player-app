import { NextResponse } from 'next/server';

// 简单的健康检查API，返回服务状态和时间戳
export async function GET() {
  try {
    // 可以在这里添加更多健康检查逻辑
    // 例如：数据库连接检查、外部服务连接检查等
    
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('健康检查失败:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
