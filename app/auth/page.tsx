'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(true)

  useEffect(() => {
    // 檢查 Supabase 是否可用
    const checkSupabase = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setIsSupabaseAvailable(true)
      } catch (err) {
        setIsSupabaseAvailable(false)
      }
    }
    checkSupabase()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (!isSupabaseAvailable) {
        // 演示模式：存儲到本地並重定向
        localStorage.setItem('demoUser', JSON.stringify({ email, isSignUp }))
        setSuccess('演示模式已啟用。正在進入儀表板...')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1000)
        return
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('註冊成功！請檢查您的電子郵件進行驗證。')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setSuccess('登入成功！')
        // 重定向到儀表板
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      setError(err.message || '發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoMode = () => {
    localStorage.setItem('demoUser', JSON.stringify({ email: 'demo@example.com', isSignUp: false }))
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
            Money Mate
          </h1>
          <p className="text-center text-slate-600 mb-8">
            {isSignUp ? '建立新帳戶' : '登入您的帳戶'}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                電子郵件
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                密碼
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg transition"
            >
              {loading ? '處理中...' : isSignUp ? '註冊' : '登入'}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-2">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setSuccess('')
              }}
              className="text-slate-600 hover:text-slate-900 text-sm"
            >
              {isSignUp ? '已有帳戶？登入' : '沒有帳戶？註冊'}
            </button>
          </div>

          {!isSupabaseAvailable && (
            <div className="mt-6 border-t pt-6">
              <p className="text-center text-slate-600 text-sm mb-4">
                Supabase 未連接。使用演示模式探索應用。
              </p>
              <button
                onClick={handleDemoMode}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
              >
                進入演示模式
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
