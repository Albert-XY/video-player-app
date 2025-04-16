import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
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
    return NextResponse.json({ error: 'Failed to fetch unrated videos' }, { status: 500 })
  }
}
