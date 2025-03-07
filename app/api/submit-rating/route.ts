import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: Request) {
  const { userId, videoId, samValence, samArousal } = await request.json()

  try {
    await pool.query(
      'INSERT INTO user_ratings (user_id, video_id, sam_valence, sam_arousal) VALUES ($1, $2, $3, $4)',
      [userId, videoId, samValence, samArousal]
    )

    await pool.query(
      'UPDATE videos SET rating_count = rating_count + 1 WHERE id = $1',
      [videoId]
    )

    // Check if the video has reached 16 ratings
    const result = await pool.query(
      'SELECT rating_count, rvm_valence, rvm_arousal FROM videos WHERE id = $1',
      [videoId]
    )

    const video = result.rows[0]

    if (video.rating_count >= 16) {
      // Calculate average SAM ratings
      const avgResult = await pool.query(
        'SELECT AVG(sam_valence) as avg_valence, AVG(sam_arousal) as avg_arousal, VARIANCE(sam_valence) as var_valence, VARIANCE(sam_arousal) as var_arousal FROM user_ratings WHERE video_id = $1',
        [videoId]
      )

      const avgRatings = avgResult.rows[0]

      // Check conditions for approval
      const isApproved = (
        (video.rvm_valence > 5 && avgRatings.avg_valence > 5 || video.rvm_valence <= 5 && avgRatings.avg_valence <= 5) &&
        (video.rvm_arousal > 5 && avgRatings.avg_arousal > 5 || video.rvm_arousal <= 5 && avgRatings.avg_arousal <= 5) &&
        avgRatings.var_valence < 4 && avgRatings.var_arousal < 4
      )

      if (isApproved) {
        await pool.query(
          'UPDATE videos SET is_approved = true WHERE id = $1',
          [videoId]
        )
      }
    }

    return NextResponse.json({ message: 'Rating submitted successfully' })
  } catch (error) {
    console.error('Error submitting rating:', error)
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 })
  }
}

