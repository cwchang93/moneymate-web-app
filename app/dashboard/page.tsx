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
  note: string
  amount: number
  type: 'income' | 'expense'
  date: string
  user_id: string
  category_name?: string
  account_name?: string
}

interface Statistics {
  totalIncome: number
  totalExpense: number
  balance: number
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', note: '工資', amount: 50000, type: 'income', date: '2024-06-15', user_id: 'demo', category_name: '薪資', account_name: '銀行' },
  { id: '2', note: '租金', amount: 15000, type: 'expense', date: '2024-06-10', user_id: 'demo', category_name: '房屋', account_name: '銀行' },
  { id: '3', note: '雜貨購物', amount: 2500, type: 'expense', date: '2024-06-08', user_id: 'demo', category_name: '購物', account_name: '現金' },
  { id: '4', note: '餐廳聚餐', amount: 800, type: 'expense', date: '2024-06-05', user_id: 'demo', category_name: '食物', account_name: '現金' },
  { id: '5', note: '兼職收入', amount: 8000, type: 'income', date: '2024-06-01', user_id: 'demo', category_name: '工作', account_name: '銀行' },
  { id: '6', note: '電費', amount: 1200, type: 'expense', date: '2024-05-28', user_id: 'demo', category_name: '公用事業', account_name: '銀行' },
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
  const [dbError, setDbError] = useState<string | null>(null)

  const initializeUser = async (userId: string) => {
    try {
      // Seed default accounts using the user's own session (RLS: auth.uid() = user_id)
      const { error: accountsError } = await supabase.from('accounts').insert([
        { user_id: userId, name: '現金', type: 'cash', balance: 0, is_default: true },
        { user_id: userId, name: '銀行', type: 'bank', balance: 0 },
      ])
      if (accountsError) throw accountsError

      // Seed default categories only if the user has none yet
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (!existingCategories || existingCategories.length === 0) {
        const { error: categoriesError } = await supabase.from('categories').insert([
          { user_id: userId, name: '薪資', type: 'income', sort_order: 1 },
          { user_id: userId, name: '兼職', type: 'income', sort_order: 2 },
          { user_id: userId, name: '投資收益', type: 'income', sort_order: 3 },
          { user_id: userId, name: '食物', type: 'expense', sort_order: 1 },
          { user_id: userId, name: '交通', type: 'expense', sort_order: 2 },
          { user_id: userId, name: '房屋', type: 'expense', sort_order: 3 },
          { user_id: userId, name: '購物', type: 'expense', sort_order: 4 },
          { user_id: userId, name: '娛樂', type: 'expense', sort_order: 5 },
          { user_id: userId, name: '公用事業', type: 'expense', sort_order: 6 },
        ])
        if (categoriesError) throw categoriesError
      }
      return true
    } catch (error) {
      console.error('Error initializing user:', error)
      return false
    }
  }

  const checkAndInitializeUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (error) {
        if (error.message?.includes("Could not find the table")) {
          setDbError('資料庫表尚未創建。請按照 DATABASE_SETUP.md 中的說明在 Supabase SQL Editor 中執行 SQL 腳本。')
        }
        throw error
      }
      
      // If no accounts exist, initialize them
      if (!data || data.length === 0) {
        await initializeUser(userId)
      }
    } catch (error) {
      console.error('Error checking user accounts:', error)
    }
  }
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
        .select(`
          id,
          note,
          amount,
          type,
          date,
          user_id,
          categories(name),
          accounts(name)
        `)
        .eq('user_id', sessionData.session.user.id)
        .order('date', { ascending: false })

      if (error) throw error
      
      // Transform data to match our Transaction interface
      const txns = (data as any[]).map(t => ({
        ...t,
        category_name: t.categories?.name,
        account_name: t.accounts?.name,
      })) as Transaction[]
      
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
          // Initialize user data if needed
          await checkAndInitializeUser(data.session.user.id)
          // Then fetch transactions
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

  const handleTransactionAdded = (demoTransaction?: Transaction) => {
    if (isDemoMode && demoTransaction) {
      const updated = [demoTransaction, ...transactions]
      setTransactions(updated)
      calculateStatistics(updated)
      setActiveView('transactions')
      return
    }
    setActiveView('transactions')
    fetchTransactions()
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

          {/* Database Error Alert */}
          {dbError && (
            <div className="rounded-lg border border-[color:var(--expense)] bg-[color:var(--expense-bg)] p-4">
              <p className="text-sm font-medium text-[color:var(--expense)] mb-2">⚠️ 數據庫配置錯誤</p>
              <p className="text-xs text-[color:var(--expense)] mb-3">{dbError}</p>
              <a
                href="/DATABASE_SETUP.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[color:var(--expense)] hover:underline"
              >
                查看設置說明 →
              </a>
            </div>
          )}

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
                <TransactionForm onSuccess={handleTransactionAdded} isDemoMode={isDemoMode} />
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
