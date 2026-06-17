'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
}

interface Account {
  id: string
  name: string
  type: string
}

interface TransactionFormProps {
  onSuccess: () => void
}

const inputClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition'

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [note, setNote] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])

  // Fetch categories and accounts on mount, with auto-initialization
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        
        if (!sessionData?.session?.user) {
          // Demo mode - use hardcoded data
          const mockCategories = [
            { id: 'food', name: '食物', type: 'expense' as const },
            { id: 'transport', name: '交通', type: 'expense' as const },
            { id: 'entertainment', name: '娛樂', type: 'expense' as const },
            { id: 'shopping', name: '購物', type: 'expense' as const },
            { id: 'work', name: '工作', type: 'income' as const },
            { id: 'salary', name: '薪資', type: 'income' as const },
          ]
          const mockAccounts = [
            { id: 'cash', name: '現金', type: 'cash' },
            { id: 'bank', name: '銀行', type: 'bank' },
          ]
          setCategories(mockCategories)
          setAccounts(mockAccounts)
          setAccountId('cash')
          setCategoryId('food')
          return
        }

        // Fetch from DB
        const [categoriesRes, accountsRes] = await Promise.all([
          supabase.from('categories').select('id, name, type').eq('user_id', sessionData.session.user.id),
          supabase.from('accounts').select('id, name, type').eq('user_id', sessionData.session.user.id),
        ])

        if (categoriesRes.error) throw categoriesRes.error
        if (accountsRes.error) throw accountsRes.error

        setCategories(categoriesRes.data || [])
        setAccounts(accountsRes.data || [])

        // Auto-select first of each
        if (accountsRes.data?.length) {
          setAccountId(accountsRes.data[0].id)
        } else {
          // No accounts found — create defaults
          const defaultAccounts = [
            { name: '現金', type: 'cash', balance: 0, is_default: true },
            { name: '銀行', type: 'bank', balance: 0 },
          ]
          const { data: newAccounts, error: insertError } = await supabase
            .from('accounts')
            .insert(defaultAccounts.map(a => ({ ...a, user_id: sessionData.session.user.id })))
            .select()

          if (insertError) throw insertError
          
          setAccounts(newAccounts || [])
          if (newAccounts?.length) setAccountId(newAccounts[0].id)
        }
        
        if (categoriesRes.data?.length) {
          setCategoryId(categoriesRes.data[0].id)
        } else {
          // No categories found — create defaults
          const defaultCategories = [
            { name: '薪資', type: 'income', sort_order: 1 },
            { name: '兼職', type: 'income', sort_order: 2 },
            { name: '投資收益', type: 'income', sort_order: 3 },
            { name: '食物', type: 'expense', sort_order: 1 },
            { name: '交通', type: 'expense', sort_order: 2 },
            { name: '房屋', type: 'expense', sort_order: 3 },
            { name: '購物', type: 'expense', sort_order: 4 },
            { name: '娛樂', type: 'expense', sort_order: 5 },
            { name: '公用事業', type: 'expense', sort_order: 6 },
          ]
          const { data: newCategories, error: insertError } = await supabase
            .from('categories')
            .insert(defaultCategories.map(c => ({ ...c, user_id: sessionData.session.user.id })))
            .select()

          if (insertError) throw insertError
          
          setCategories(newCategories || [])
          if (newCategories?.length) setCategoryId(newCategories[0].id)
        }
      } catch (err) {
        // Fallback to mock data if any error occurs
        const mockCategories = [
          { id: 'food', name: '食物', type: 'expense' as const },
          { id: 'transport', name: '交通', type: 'expense' as const },
          { id: 'entertainment', name: '娛樂', type: 'expense' as const },
          { id: 'shopping', name: '購物', type: 'expense' as const },
          { id: 'work', name: '工作', type: 'income' as const },
          { id: 'salary', name: '薪資', type: 'income' as const },
        ]
        const mockAccounts = [
          { id: 'cash', name: '現金', type: 'cash' },
          { id: 'bank', name: '銀行', type: 'bank' },
        ]
        setCategories(mockCategories)
        setAccounts(mockAccounts)
        setAccountId('cash')
        setCategoryId('food')
      }
    }

    fetchData()
  }, [])

  // Filter categories by type
  const filteredCategories = categories.filter((c) => c.type === type)

  // Reset category when type changes
  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.find((c) => c.id === categoryId)) {
      setCategoryId(filteredCategories[0].id)
    }
  }, [type, filteredCategories, categoryId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id

      if (!userId) {
        setError('請先登入才能儲存交易。')
        setLoading(false)
        return
      }

      if (!accountId) {
        setError('請先選擇帳戶')
        setLoading(false)
        return
      }

      const { error: insertError } = await supabase.from('transactions').insert([
        {
          user_id: userId,
          account_id: accountId,
          category_id: categoryId || null,
          type,
          amount: parseFloat(amount),
          note,
          date,
        },
      ])

      if (insertError) throw insertError

      setNote('')
      setAmount('')
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
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">帳戶</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">選擇帳戶</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">分類</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
          >
            <option value="">無分類</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
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
        disabled={loading || !accountId}
        className="w-full py-2.5 text-sm font-semibold rounded-lg bg-foreground text-background hover:opacity-90 disabled:opacity-50 transition"
      >
        {loading ? '儲存中...' : '儲存交易'}
      </button>
    </form>
  )
}
