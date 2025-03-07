'use client'

import { useState, useEffect, useRef } from 'react'
import { handleFetchError } from '@/lib/utils'
import SAMScale from '@/components/experiments/SAMScale'

interface Video {
  id: string
  title: string
  src: string
}

interface VideoPlayerProps {
  username: string
  userId: number
}

export default function SAMVideoPlayer({ username, userId }: VideoPlayerProps) {
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
    setShowSAMScale(true)
  }

  const handleSAMScaleSubmit = async (valence: number, arousal: number) => {
    const currentVideo = videos[currentVideoIndex]
    try {
      await fetch('/api/submit-rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          videoId: currentVideo.id,
          samValence: valence,
          samArousal: arousal,
        }),
      })
      nextVideo()
    } catch (error) {
      console.error('Error submitting rating:', error)
    }
  }

  if (isLoading) {
    return <div>Loading videos...</div>
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  if (videos.length === 0) {
    return <div>No videos available for rating.</div>
  }

  const currentVideo = videos[currentVideoIndex]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center text-indigo-600">Welcome, {username}!</h2>
      <h2 className="text-2xl font-semibold text-center text-indigo-600">SAM Scale Video Player</h2>
      <div className="aspect-w-16 aspect-h-9">
        <video
          ref={videoRef}
          key={currentVideo.id}
          className="w-full h-full object-cover rounded-lg shadow-lg"
          controls
          onPlay={handleVideoStart}
          onEnded={handleVideoEnd}
        >
          <source src={currentVideo.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{currentVideo.title}</h3>
      </div>
      {showSAMScale && (
        <SAMScale onSubmit={handleSAMScaleSubmit} />
      )}
    </div>
  )
}
