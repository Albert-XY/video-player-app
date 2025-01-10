import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
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
    return NextResponse.json({ error: 'Failed to fetch approved videos' }, { status: 500 })
  }
}

