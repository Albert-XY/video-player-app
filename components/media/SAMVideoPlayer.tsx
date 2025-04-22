'use client'

import { useState, useEffect, useRef } from 'react'
import { handleFetchError } from '@/lib/utils'
import SAMScale from '@/components/media/SAMScale'

interface Video {
  id: string
  title: string
  src: string
}

interface SAMVideoPlayerProps {
  username?: string
  userId?: number
}

export default function SAMVideoPlayer({ username = '', userId = 0 }: SAMVideoPlayerProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSAMScale, setShowSAMScale] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/unrated-videos')
      const data = await handleFetchError(response)
      setVideos(data)
    } catch (error) {
      setError('Failed to fetch videos. Please try again later.')
      console.error('Error fetching videos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
    setShowSAMScale(false)
  }

  const handleVideoStart = () => {
    startTimeRef.current = Date.now()
  }

  const handleVideoEnd = () => {
    if (!showSAMScale) {
      setShowSAMScale(true)
    }
  }

  const handleSAMSubmit = async (arousal: number, valence: number) => {
    const currentVideo = videos[currentVideoIndex]
    const endTime = Date.now()
    const watchDuration = startTimeRef.current ? (endTime - startTimeRef.current) / 1000 : 0

    try {
      // 注意：后端API期望的参数顺序是 valence 在前，arousal 在后
      const response = await fetch('/api/sam-ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: currentVideo.id,
          userId,
          valence, // 交换顺序，确保与后端API匹配
          arousal,
          watchDuration,
        }),
      })

      if (response.ok) {
        nextVideo()
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to submit rating')
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      setError('Network error. Please try again.')
    }
  }

  if (isLoading && videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
        <button
          onClick={fetchVideos}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
        <p>No videos available for rating.</p>
      </div>
    )
  }

  const currentVideo = videos[currentVideoIndex]

  return (
    <div className="space-y-4">
      {!showSAMScale ? (
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={currentVideo.src}
              controls
              className="w-full h-full"
              onPlay={handleVideoStart}
              onEnded={handleVideoEnd}
            />
          </div>
          <h3 className="text-lg font-medium">{currentVideo.title}</h3>
        </div>
      ) : (
        <SAMScale onSubmit={handleSAMSubmit} />
      )}
    </div>
  )
}
