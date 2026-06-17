'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import TransactionList from '@/components/TransactionList'
import TransactionForm from '@/components/TransactionForm'
import StatisticsCard from '@/components/StatisticsCard'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Transaction {
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

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [statistics, setStatistics] = useState<Statistics>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    checkUser()
    fetchTransactions()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      window.location.href = '/auth'
    } else {
      setUser(data.session.user)
    }
  }

  const fetchTransactions = async () => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false })

      if (error) throw error

      const txns = data as Transaction[]
      setTransactions(txns)

      // 計算統計
      const income = txns
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const expense = txns
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      setStatistics({
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
      })
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  const handleTransactionAdded = () => {
    setShowForm(false)
    fetchTransactions()
  }

  // 準備圖表數據
  const chartData = transactions
    .slice()
    .reverse()
    .slice(0, 30)
    .map((t) => ({
      date: new Date(t.date).toLocaleDateString('zh-TW'),
      amount: t.amount,
      type: t.type,
    }))
    .reduce((acc, item) => {
      const existing = acc.find((a) => a.date === item.date)
      if (existing) {
        if (item.type === 'income') existing.income = (existing.income || 0) + item.amount
        else existing.expense = (existing.expense || 0) + item.amount
      } else {
        acc.push({
          date: item.date,
          income: item.type === 'income' ? item.amount : 0,
          expense: item.type === 'expense' ? item.amount : 0,
        })
      }
      return acc
    }, [] as any[])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-600">載入中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Money Mate</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">{user?.email}</span>
            <Button
              onClick={handleLogout}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              登出
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatisticsCard
            title="收入"
            amount={statistics.totalIncome}
            color="green"
          />
          <StatisticsCard
            title="支出"
            amount={statistics.totalExpense}
            color="red"
          />
          <StatisticsCard
            title="結餘"
            amount={statistics.balance}
            color={statistics.balance >= 0 ? 'blue' : 'red'}
          />
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">近期趨勢</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" name="收入" />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" name="支出" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Actions and Transactions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-900">交易記錄</h2>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            {showForm ? '關閉' : '新增交易'}
          </Button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <TransactionForm onSuccess={handleTransactionAdded} />
          </div>
        )}

        {/* Transaction List */}
        <div className="bg-white rounded-lg shadow">
          <TransactionList
            transactions={transactions}
            onTransactionDeleted={fetchTransactions}
          />
        </div>
      </main>
    </div>
  )
}
