'use client'

import { useState, useEffect } from 'react'
import RegisterForm from '@/components/RegisterForm'
import LoginForm from '@/components/LoginForm'
import SAMVideoPlayer from '@/components/SAMVideoPlayer'
import ExperimentalVideoPlayer from '@/components/ExperimentalVideoPlayer'
import Background3D from '@/components/Background3D'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [playerChoice, setPlayerChoice] = useState<'sam' | 'experimental' | null>(null)

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const storedUsername = localStorage.getItem('username')
    const storedUserId = localStorage.getItem('userId')
    setIsLoggedIn(loggedIn)
    if (storedUsername) setUsername(storedUsername)
    if (storedUserId) setUserId(parseInt(storedUserId))
    setIsLoading(false)
  }, [])

  const handleLogin = (user: string, id: number) => {
    setIsLoggedIn(true)
    setUsername(user)
    setUserId(id)
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('username', user)
    localStorage.setItem('userId', id.toString())
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    setUserId(null)
    setPlayerChoice(null)
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('userId')
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <>
      <Background3D />
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="bg-white bg-opacity-90 rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">Video Player App</h1>
          {!isLoggedIn ? (
            <>
              <RegisterForm setMessage={setMessage} setError={setError} onRegister={handleLogin} />
              <div className="my-4 border-t border-gray-300"></div>
              <LoginForm setMessage={setMessage} setError={setError} onLogin={handleLogin} />
            </>
          ) : (
            <>
              {!playerChoice ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-center">Welcome, {username}!</h2>
                  <p className="text-center">Choose a video player:</p>
                  <button
                    onClick={() => setPlayerChoice('sam')}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    SAM Scale Video Player
                  </button>
                  <button
                    onClick={() => setPlayerChoice('experimental')}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Experimental Video Player
                  </button>
                </div>
              ) : (
                <>
                  {playerChoice === 'sam' && userId && (
                    <SAMVideoPlayer username={username} userId={userId} />
                  )}
                  {playerChoice === 'experimental' && userId && (
                    <ExperimentalVideoPlayer username={username} userId={userId} />
                  )}
                  <button
                    onClick={() => setPlayerChoice(null)}
                    className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Back to Player Selection
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </>
          )}
          {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
          {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        </div>
      </div>
    </>
  )
}

