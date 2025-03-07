import { NextResponse } from 'next/server'
import pool from '@/lib/db'

// 获取用户的评分历史
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: '用户ID是必须的' }, { status: 400 })
    }
    
    const result = await pool.query(`
      SELECT ur.id, v.title as video_title, ur.sam_valence, ur.sam_arousal, ur.created_at as rating_date
      FROM user_ratings ur
      JOIN videos v ON ur.video_id = v.id
      WHERE ur.user_id = $1
      ORDER BY ur.created_at DESC
    `, [userId])
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching user ratings:', error)
    return NextResponse.json({ error: '获取用户评分失败' }, { status: 500 })
  }
}
