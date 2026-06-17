'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const inputClass =
  'w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(true)

  useEffect(() => {
    const check = async () => {
      try {
        await supabase.auth.getSession()
        setIsSupabaseAvailable(true)
      } catch {
        setIsSupabaseAvailable(false)
      }
    }
    check()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (!isSupabaseAvailable) {
        localStorage.setItem('demoUser', JSON.stringify({ email }))
        setSuccess('演示模式已啟用，正在進入儀表板...')
        setTimeout(() => { window.location.href = '/dashboard' }, 800)
        return
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('註冊成功！請前往信箱確認驗證信。')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      setError(err.message || '發生錯誤，請再試一次')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoMode = () => {
    localStorage.setItem('demoUser', JSON.stringify({ email: 'demo@example.com' }))
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-sidebar flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <svg width="16" height="16" fill="none" stroke="var(--sidebar)" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-base font-semibold text-sidebar-primary">Money Mate</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-sidebar-primary leading-tight text-balance mb-4">
            掌握您的每一分財務
          </h1>
          <p className="text-sidebar-foreground/60 text-base leading-relaxed">
            輕鬆記錄收入與支出，清楚掌握資金流向，讓理財更有計畫。
          </p>
        </div>

        <p className="text-xs text-sidebar-foreground/30">
          &copy; {new Date().getFullYear()} Money Mate
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
              <svg width="13" height="13" fill="none" stroke="var(--background)" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-base font-semibold text-foreground">Money Mate</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">
            {isSignUp ? '建立新帳戶' : '歡迎回來'}
          </h2>
          <p className="text-sm text-muted-foreground mb-7">
            {isSignUp ? '填寫以下資料開始使用' : '輸入帳號密碼繼續'}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                電子郵件
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                密碼
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-[color:var(--expense)] bg-[color:var(--expense-bg)] px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            {success && (
              <p className="text-xs text-[color:var(--income)] bg-[color:var(--income-bg)] px-3 py-2 rounded-lg">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-foreground text-background hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? '處理中...' : isSignUp ? '建立帳戶' : '登入'}
            </button>
          </form>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">或</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={handleDemoMode}
            className="mt-4 w-full py-2.5 text-sm font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-secondary transition"
          >
            使用演示模式
          </button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {isSignUp ? '已有帳戶？' : '還沒有帳戶？'}
            {' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess('') }}
              className="font-medium text-foreground hover:underline"
            >
              {isSignUp ? '登入' : '立即註冊'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
