'use client'

import { supabase } from '@/lib/supabase'

export interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
}

interface TransactionListProps {
  transactions: Transaction[]
  onTransactionDeleted: (id: string) => void
  compact?: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  '工作': 'bg-blue-100 text-blue-700',
  '薪資': 'bg-blue-100 text-blue-700',
  '房屋': 'bg-purple-100 text-purple-700',
  '餐飲': 'bg-orange-100 text-orange-700',
  '食物': 'bg-orange-100 text-orange-700',
  '日用品': 'bg-yellow-100 text-yellow-700',
  '購物': 'bg-pink-100 text-pink-700',
  '公用事業': 'bg-slate-100 text-slate-700',
  '交通': 'bg-cyan-100 text-cyan-700',
  '娛樂': 'bg-violet-100 text-violet-700',
}

function getCategoryStyle(category: string) {
  return CATEGORY_COLORS[category] ?? 'bg-secondary text-muted-foreground'
}

export default function TransactionList({ transactions, onTransactionDeleted, compact = false }: TransactionListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這筆交易嗎？')) return
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
      onTransactionDeleted(id)
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">還沒有交易記錄。</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {transactions.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-4 px-6 py-3.5 hover:bg-secondary/40 transition group"
        >
          {/* Type indicator */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              t.type === 'income'
                ? 'bg-[color:var(--income-bg)] text-[color:var(--income)]'
                : 'bg-[color:var(--expense-bg)] text-[color:var(--expense)]'
            }`}
          >
            {t.type === 'income' ? (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          {/* Description + category */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
            {!compact && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getCategoryStyle(t.category)}`}>
                  {t.category}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(t.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>

          {/* Date (compact only) */}
          {compact && (
            <span className="text-[11px] text-muted-foreground shrink-0">
              {new Date(t.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
            </span>
          )}

          {/* Amount */}
          <p className={`text-sm font-semibold shrink-0 ${
            t.type === 'income' ? 'text-[color:var(--income)]' : 'text-[color:var(--expense)]'
          }`}>
            {t.type === 'income' ? '+' : '-'}NT${t.amount.toLocaleString('zh-TW')}
          </p>

          {/* Delete button — only visible on hover, hidden in compact */}
          {!compact && (
            <button
              onClick={() => handleDelete(t.id)}
              className="opacity-0 group-hover:opacity-100 transition ml-1 p-1 rounded text-muted-foreground hover:text-[color:var(--expense)] hover:bg-[color:var(--expense-bg)]"
              aria-label="刪除"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
