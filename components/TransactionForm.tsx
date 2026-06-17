'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const CATEGORIES = ['食物', '交通', '娛樂', '購物', '工作', '薪資', '房屋', '公用事業', '其他']

interface TransactionFormProps {
  onSuccess: () => void
}

const inputClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition'

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('食物')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session?.user) throw new Error('未登入，無法儲存至資料庫')

      const { error: insertError } = await supabase.from('transactions').insert([
        {
          user_id: sessionData.session.user.id,
          description,
          amount: parseFloat(amount),
          category,
          type,
          date,
        },
      ])

      if (insertError) throw insertError

      setDescription('')
      setAmount('')
      setCategory('食物')
      setType('expense')
      setDate(new Date().toISOString().split('T')[0])
      onSuccess()
    } catch (err: any) {
      setError(err.message || '發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type toggle */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-2">類型</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 text-sm rounded-lg font-medium border transition ${
              type === 'expense'
                ? 'bg-[color:var(--expense-bg)] text-[color:var(--expense)] border-[color:var(--expense)]'
                : 'bg-card text-muted-foreground border-border hover:bg-secondary'
            }`}
          >
            支出
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 text-sm rounded-lg font-medium border transition ${
              type === 'income'
                ? 'bg-[color:var(--income-bg)] text-[color:var(--income)] border-[color:var(--income)]'
                : 'bg-card text-muted-foreground border-border hover:bg-secondary'
            }`}
          >
            收入
          </button>
        </div>
      </div>

      {/* Grid fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">說明</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
            placeholder="例如：午餐"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">金額（NT$）</label>
          <input
            type="number"
            step="1"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
            placeholder="0"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">分類</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
            required
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-[color:var(--expense)] bg-[color:var(--expense-bg)] px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 text-sm font-semibold rounded-lg bg-foreground text-background hover:opacity-90 disabled:opacity-50 transition"
      >
        {loading ? '儲存中...' : '儲存交易'}
      </button>
    </form>
  )
}
