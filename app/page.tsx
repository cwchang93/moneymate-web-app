'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  useEffect(() => {
    // 檢查用戶是否已登入
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        window.location.href = '/dashboard'
      }
    }
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Money Mate</h1>
          <Link href="/auth">
            <Button className="bg-white text-slate-900 hover:bg-slate-100">
              開始使用
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            控制您的財務
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Money Mate
            是一個簡單而強大的個人記帳應用。輕鬆追蹤您的收入和支出，並獲得詳細的財務分析。
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/auth">
              <Button className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-3">
                免費開始
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">詳細統計</h3>
            <p className="text-slate-400">
              實時查看您的收入、支出和結餘。清晰的圖表幫助您理解財務狀況。
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition">
            <div className="text-3xl mb-4">💾</div>
            <h3 className="text-lg font-semibold text-white mb-2">安全存儲</h3>
            <p className="text-slate-400">
              您的數據安全地存儲在 Supabase
              中。只有您可以訪問您的財務信息。
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-white mb-2">快速和簡單</h3>
            <p className="text-slate-400">
              直觀的界面使添加交易快速而簡單。幾秒鐘內記錄您的支出。
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
