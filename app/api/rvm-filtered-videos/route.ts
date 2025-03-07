import { NextResponse } from 'next/server'
import pool from '@/lib/db'

// 获取通过RVM初筛但尚未通过SAM评估的视频
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '10'
    
    const result = await pool.query(`
      SELECT id, title, src, rvm_valence, rvm_arousal
      FROM videos 
      WHERE 
        -- RVM筛选条件：valence和arousal已计算
        rvm_valence IS NOT NULL AND 
        rvm_arousal IS NOT NULL AND
        -- 计算RVM筛选分数
        (rvm_valence * rvm_valence + rvm_arousal * rvm_arousal) > 1.0 AND
        -- 尚未经过足够SAM评分通过最终审核
        (rating_count IS NULL OR rating_count < 16 OR is_approved IS NULL OR is_approved = false)
      ORDER BY RANDOM()
      LIMIT $1
    `, [parseInt(limit)])

    // 没有可评估视频时
    if (result.rows.length === 0) {
      return NextResponse.json([])
    }

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching RVM filtered videos:', error)
    return NextResponse.json({ error: '获取RVM筛选视频失败' }, { status: 500 })
  }
}
