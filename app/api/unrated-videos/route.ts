import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { mockVideos, shouldUseMockData, mockDelay } from '../mock-data-provider'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  // 检查用户ID
  if (!userId && !shouldUseMockData()) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    // 如果设置了跳过数据库连接，返回模拟数据
    if (shouldUseMockData()) {
      console.log('Using mock unrated videos data for build process')
      await mockDelay()
      // 获取模拟数据的一个子集作为未评级视频
      const unratedMockVideos = mockVideos.slice(0, 3).map(video => ({
        ...video,
        is_approved: false
      }))
      return NextResponse.json(unratedMockVideos)
    }

    // 正常数据库查询
    const result = await pool.query(`
      SELECT v.id, v.title, v.src
      FROM videos v
      LEFT JOIN user_ratings ur ON v.id = ur.video_id AND ur.user_id = $1
      WHERE ur.id IS NULL AND v.is_approved = false
      ORDER BY RANDOM()
      LIMIT 5
    `, [userId])

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching unrated videos:', error)
    // 如果发生错误且设置了环境变量，也返回模拟数据
    if (shouldUseMockData()) {
      console.log('Error occurred, falling back to mock unrated videos data')
      const unratedMockVideos = mockVideos.slice(0, 3).map(video => ({
        ...video,
        is_approved: false
      }))
      return NextResponse.json(unratedMockVideos)
    }
    return NextResponse.json({ error: 'Failed to fetch unrated videos' }, { status: 500 })
  }
}
