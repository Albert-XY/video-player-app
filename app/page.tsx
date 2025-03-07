'use client'

import { useState, useEffect } from 'react'
import RegisterForm from '../components/forms/RegisterForm'
import LoginForm from '../components/forms/LoginForm'
import SAMVideoPlayer from '../components/media/SAMVideoPlayer'
import ExperimentalVideoPlayer from '../components/experiments/ExperimentalVideoPlayer'
import Background3D from '../components/Background3D'

export default function Home() {
  // 状态定义
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [playerChoice, setPlayerChoice] = useState<'sam' | 'experimental' | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 登出处理函数
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPlayerChoice(null);
    setMessage('Successfully logged out');
  };

  return (
    <>
      <Background3D />
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="bg-background/90 rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-primary">
            Video Player App
          </h1>
          
          {/* 登录/注册界面 */}
          {!isLoggedIn ? (
            <>
              <RegisterForm onRegister={(user) => {
                setMessage(`User ${user} registered successfully!`);
                setTimeout(() => setMessage(''), 3000);
              }} />
              <div className="my-4 border-t border-foreground/20" />
              <LoginForm onLogin={(user) => {
                setIsLoggedIn(true);
                setUsername(user);
                setMessage(`Welcome back, ${user}!`);
                setTimeout(() => setMessage(''), 3000);
              }} />
            </>
          ) : (
            <>
              {/* 播放器选择界面 */}
              {!playerChoice ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-center">
                    Welcome, {username}!
                  </h2>
                  <div className="grid gap-4">
                    <button
                      onClick={() => setPlayerChoice('sam')}
                      className="auth-form-button bg-primary hover:bg-primary/90 focus:ring-primary"
                    >
                      SAM Scale Video Player
                    </button>
                    <button
                      onClick={() => setPlayerChoice('experimental')}
                      className="auth-form-button bg-secondary hover:bg-secondary/90 focus:ring-secondary"
                    >
                      Experimental Video Player
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* 播放器展示 */}
                  {playerChoice === 'sam' && <SAMVideoPlayer userId={username} />}
                  {playerChoice === 'experimental' && <ExperimentalVideoPlayer userId={username} />}
                  <button
                    onClick={() => setPlayerChoice(null)}
                    className="auth-form-button bg-foreground/10 hover:bg-foreground/20 text-foreground mt-4"
                  >
                    Back to Selection
                  </button>
                </>
              )}

              {/* 登出按钮 */}
              <button
                onClick={handleLogout}
                className="auth-form-button bg-destructive hover:bg-destructive/90 focus:ring-destructive mt-4"
              >
                Logout
              </button>
            </>
          )}

          {/* 消息提示 */}
          {message && (
            <p className="mt-4 text-center text-green-600 dark:text-green-400">
              {message}
            </p>
          )}
          {error && (
            <p className="mt-4 text-center text-destructive dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  )
}