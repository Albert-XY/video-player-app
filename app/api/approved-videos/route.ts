import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { mockVideos, shouldUseMockData, mockDelay } from '../mock-data-provider'

export async function GET() {
  try {
    // 如果设置了跳过数据库连接，返回模拟数据
    if (shouldUseMockData()) {
      console.log('Using mock approved videos data for build process')
      await mockDelay()
      // 获取模拟数据的一个子集作为已批准视频
      const approvedMockVideos = mockVideos.slice(0, 2).map(video => ({
        ...video,
        is_approved: true,
        rvm_valence: 0.75,
        rvm_arousal: 0.65
      }))
      return NextResponse.json(approvedMockVideos)
    }

    // 正常数据库查询
    const result = await pool.query(`
      SELECT id, title, src, rvm_valence as valence, rvm_arousal as arousal
      FROM videos
      WHERE is_approved = true
      ORDER BY RANDOM()
      LIMIT 5
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching approved videos:', error)
    // 如果发生错误且设置了环境变量，也返回模拟数据
    if (shouldUseMockData()) {
      console.log('Error occurred, falling back to mock approved videos data')
      const approvedMockVideos = mockVideos.slice(0, 2).map(video => ({
        ...video,
        is_approved: true,
        rvm_valence: 0.75,
        rvm_arousal: 0.65
      }))
      return NextResponse.json(approvedMockVideos)
    }
    return NextResponse.json({ error: 'Failed to fetch approved videos' }, { status: 500 })
  }
}
