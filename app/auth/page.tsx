'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isDemoMode, setIsDemoMode] = useState(true)

  useEffect(() => {
    // 默认使用演示模式（如果 Supabase 配置正确，可在 .env.local 中设置）
    const hasSupabaseConfig = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

    setIsDemoMode(!hasSupabaseConfig)
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('请填写所有字段')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // 演示模式：直接保存到本地并重定向
      localStorage.setItem('demoUser', JSON.stringify({ 
        email, 
        isSignUp,
        createdAt: new Date().toISOString()
      }))
      
      setSuccess(isSignUp ? '演示账户创建成功！' : '演示登入成功！')
      
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
    } catch (err: any) {
      setError(err.message || '发生错误')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemo = () => {
    localStorage.setItem('demoUser', JSON.stringify({ 
      email: 'demo@moneymate.app', 
      isSignUp: false,
      createdAt: new Date().toISOString()
    }))
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
            {isSignUp ? '建立新帐户' : '登入您的帐户'}
          </p>

          {isDemoMode && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                演示模式已启用。您的数据将存储在本地。
              </p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                电子邮件
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
                密码
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
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '处理中...' : isSignUp ? '注册' : '登入'}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setSuccess('')
              }}
              className="text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              {isSignUp ? '已有帐户？登入' : '没有帐户？注册'}
            </button>
          </div>

          <div className="mt-6 border-t pt-6">
            <button
              onClick={handleQuickDemo}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium py-2 rounded-lg transition"
            >
              快速体验演示
            </button>
            <p className="text-center text-xs text-slate-500 mt-3">
              点击上方按钮查看预加载的示例数据
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
