'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import TransactionList from '@/components/TransactionList'
import TransactionForm from '@/components/TransactionForm'
import StatisticsCard from '@/components/StatisticsCard'
import SupabaseTest from '@/components/SupabaseTest'
import Sidebar from '@/components/Sidebar'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  user_id: string
}

interface Statistics {
  totalIncome: number
  totalExpense: number
  balance: number
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', description: '工資', amount: 50000, category: '工作', type: 'income', date: '2024-06-15', user_id: 'demo' },
  { id: '2', description: '租金', amount: 15000, category: '房屋', type: 'expense', date: '2024-06-10', user_id: 'demo' },
  { id: '3', description: '雜貨購物', amount: 2500, category: '日用品', type: 'expense', date: '2024-06-08', user_id: 'demo' },
  { id: '4', description: '餐廳聚餐', amount: 800, category: '餐飲', type: 'expense', date: '2024-06-05', user_id: 'demo' },
  { id: '5', description: '兼職收入', amount: 8000, category: '工作', type: 'income', date: '2024-06-01', user_id: 'demo' },
  { id: '6', description: '電費', amount: 1200, category: '公用事業', type: 'expense', date: '2024-05-28', user_id: 'demo' },
]

type ActiveView = 'overview' | 'transactions' | 'add' | 'test'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)
  const [statistics, setStatistics] = useState<Statistics>({ totalIncome: 0, totalExpense: 0, balance: 0 })
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [activeView, setActiveView] = useState<ActiveView>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const calculateStatistics = useCallback((txns: Transaction[]) => {
    const income = txns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expense = txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    setStatistics({ totalIncome: income, totalExpense: expense, balance: income - expense })
  }, [])

  const fetchTransactions = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session?.user) return

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', sessionData.session.user.id)
        .order('date', { ascending: false })

      if (error) throw error
      const txns = data as Transaction[]
      setTransactions(txns)
      calculateStatistics(txns)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }, [calculateStatistics])

  useEffect(() => {
    const checkUser = async () => {
      try {
        const demoUser = localStorage.getItem('demoUser')
        if (demoUser) {
          setIsDemoMode(true)
          setUser(JSON.parse(demoUser))
          calculateStatistics(MOCK_TRANSACTIONS)
          setLoading(false)
          return
        }
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          window.location.href = '/auth'
        } else {
          setUser(data.session.user)
          await fetchTransactions()
        }
      } catch {
        setLoading(false)
      }
    }
    checkUser()
  }, [calculateStatistics, fetchTransactions])

  const handleLogout = async () => {
    if (isDemoMode) {
      localStorage.removeItem('demoUser')
    } else {
      await supabase.auth.signOut()
    }
    window.location.href = '/auth'
  }

  const handleTransactionAdded = () => {
    setActiveView('transactions')
    if (!isDemoMode) fetchTransactions()
  }

  const handleTransactionDeleted = (deletedId: string) => {
    if (isDemoMode) {
      const updated = transactions.filter(t => t.id !== deletedId)
      setTransactions(updated)
      calculateStatistics(updated)
    } else {
      fetchTransactions()
    }
  }

  // Chart data — aggregate income/expense by date
  const chartData = transactions
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .reduce((acc, t) => {
      const label = new Date(t.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
      const existing = acc.find(a => a.date === label)
      if (existing) {
        if (t.type === 'income') existing.income = (existing.income || 0) + t.amount
        else existing.expense = (existing.expense || 0) + t.amount
      } else {
        acc.push({ date: label, income: t.type === 'income' ? t.amount : 0, expense: t.type === 'expense' ? t.amount : 0 })
      }
      return acc
    }, [] as { date: string; income: number; expense: number }[])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground text-sm">載入中...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onNavigate={(view) => { setActiveView(view); setSidebarOpen(false) }}
        onLogout={handleLogout}
        user={user}
        isDemoMode={isDemoMode}
        isOpen={sidebarOpen}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-card px-6 py-4">
          <button
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition"
            onClick={() => setSidebarOpen(true)}
            aria-label="開啟選單"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-foreground">
              {activeView === 'overview' && '總覽'}
              {activeView === 'transactions' && '交易記錄'}
              {activeView === 'add' && '新增交易'}
              {activeView === 'test' && 'Supabase 連線測試'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {isDemoMode && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
              演示模式
            </span>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 space-y-6">

          {/* OVERVIEW */}
          {activeView === 'overview' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatisticsCard title="本月收入" amount={statistics.totalIncome} variant="income" />
                <StatisticsCard title="本月支出" amount={statistics.totalExpense} variant="expense" />
                <StatisticsCard title="目前結餘" amount={statistics.balance} variant="balance" />
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4">近期趨勢</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }}
                        labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
                      />
                      <Line type="monotone" dataKey="income" stroke="var(--income)" strokeWidth={2} dot={false} name="收入" />
                      <Line type="monotone" dataKey="expense" stroke="var(--expense)" strokeWidth={2} dot={false} name="支出" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Recent transactions preview */}
              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">最近交易</h3>
                  <button
                    onClick={() => setActiveView('transactions')}
                    className="text-xs text-muted-foreground hover:text-foreground transition"
                  >
                    查看全部
                  </button>
                </div>
                <TransactionList
                  transactions={transactions.slice(0, 5)}
                  onTransactionDeleted={handleTransactionDeleted}
                  compact
                />
              </div>
            </>
          )}

          {/* TRANSACTIONS */}
          {activeView === 'transactions' && (
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">所有交易</h3>
                <button
                  onClick={() => setActiveView('add')}
                  className="text-xs font-medium px-3 py-1.5 bg-foreground text-background rounded-lg hover:opacity-90 transition"
                >
                  + 新增
                </button>
              </div>
              <TransactionList
                transactions={transactions}
                onTransactionDeleted={handleTransactionDeleted}
              />
            </div>
          )}

          {/* ADD */}
          {activeView === 'add' && (
            <div className="max-w-xl">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-6">新增交易</h3>
                <TransactionForm onSuccess={handleTransactionAdded} />
              </div>
            </div>
          )}

          {/* TEST */}
          {activeView === 'test' && <SupabaseTest />}

        </main>
      </div>
    </div>
  )
}
