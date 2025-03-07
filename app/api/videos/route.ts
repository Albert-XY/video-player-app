import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { mockVideos, shouldUseMockData, mockDelay } from '../mock-data-provider'

export async function GET() {
  try {
    // 如果设置了跳过数据库连接，返回模拟数据
    if (shouldUseMockData()) {
      console.log('Using mock video data for build process')
      await mockDelay()
      return NextResponse.json(mockVideos, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    // 正常数据库连接
    const result = await pool.query('SELECT id, title, src, valence, arousal FROM videos ORDER BY RANDOM() LIMIT 5')
    return NextResponse.json(result.rows, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
    // 如果发生错误且设置了环境变量，也返回模拟数据
    if (shouldUseMockData()) {
      console.log('Error occurred, falling back to mock data')
      return NextResponse.json(mockVideos, { 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}
