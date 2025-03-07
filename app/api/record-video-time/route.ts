import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: Request) {
  const { username, videoId, startTime, endTime } = await request.json()

  try {
    await pool.query(
      'INSERT INTO video_views (username, video_id, start_time, end_time) VALUES ($1, $2, $3, $4)',
      [username, videoId, startTime, endTime]
    )
    return NextResponse.json({ message: 'Video time recorded successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error recording video time:', error)
    return NextResponse.json({ error: 'Failed to record video time' }, { status: 500 })
  }
}

