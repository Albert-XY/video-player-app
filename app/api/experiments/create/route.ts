import { NextResponse } from 'next/server'
import pool from '@/lib/db'

/**
 * 创建实验API接口
 * 接收实验类型、用户数据和用户ID，创建新的实验记录并返回实验ID
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, userData, userId } = body

    if (!type) {
      return NextResponse.json({ error: '实验类型是必需的' }, { status: 400 })
    }

    // 在数据库中创建实验记录
    const result = await pool.query(
      `INSERT INTO experiments (type, user_id, metadata, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, type, created_at`,
      [type, userId, JSON.stringify(userData)]
    )

    const experimentId = result.rows[0].id

    return NextResponse.json({
      experimentId,
      message: '实验创建成功',
      status: 'success'
    })
  } catch (error) {
    console.error('创建实验失败:', error)
    return NextResponse.json({ error: '创建实验失败' }, { status: 500 })
  }
}
