'use client'

import { useState, useEffect, useRef } from 'react'

interface Video {
  id: number
  title: string
  url: string
  valence: number
  arousal: number
}

interface ExperimentalVideoPlayerProps {
  username?: string
  userId?: number
}

export default function ExperimentalVideoPlayer({ username, userId }: ExperimentalVideoPlayerProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/videos/random?count=5')
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      const data = await response.json()
      setVideos(data)
    } catch (error) {
      setError('Failed to fetch videos. Please try again later.')
      console.error('Error fetching videos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextVideo = () => {
    if (videos.length > 0) {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
    }
  }

  const handleVideoStart = () => {
    startTimeRef.current = Date.now()
  }

  const handleVideoEnd = async () => {
    if (startTimeRef.current && userId) {
      const endTime = Date.now()
      const currentVideo = videos[currentVideoIndex]

      try {
        await fetch('/api/videos/watch-time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            videoId: currentVideo.id,
            startTime: new Date(startTimeRef.current).toISOString(),
            endTime: new Date(endTime).toISOString(),
          }),
        })
      } catch (error) {
        console.error('Error recording video time:', error)
      }

      startTimeRef.current = null
    }

    nextVideo()
  }

  if (isLoading) {
    return <div>Loading videos...</div>
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  if (videos.length === 0) {
    return <div>No videos available.</div>
  }

  const currentVideo = videos[currentVideoIndex]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center text-indigo-600">实验视频播放</h2>
      <div className="aspect-w-16 aspect-h-9">
        <video
          ref={videoRef}
          key={currentVideo.id}
          className="w-full h-full object-cover rounded-lg shadow-lg"
          controls
          autoPlay
          onPlay={handleVideoStart}
          onEnded={handleVideoEnd}
        >
          <source src={currentVideo.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{currentVideo.title}</h3>
        <div className="text-sm text-gray-600">
          <span>效价: {currentVideo.valence?.toFixed(2) || '未知'}</span>
          <span className="ml-2">唤醒度: {currentVideo.arousal?.toFixed(2) || '未知'}</span>
        </div>
      </div>
    </div>
  )
} 