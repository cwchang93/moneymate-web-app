'use client'

import { supabase } from '@/lib/supabase'

export interface Transaction {
  id: string
  note: string
  amount: number
  type: 'income' | 'expense'
  date: string
  category_name?: string
  account_name?: string
}

interface TransactionListProps {
  transactions: Transaction[]
  onTransactionDeleted: (id: string) => void
  compact?: boolean
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
        <p className="text-sm" style={{ color: '#5d5e61' }}>還沒有交易記錄。</p>
      </div>
    )
  }

  return (
    <div>
      {transactions.map((t, index) => {
        const isIncome = t.type === 'income'
        const barColor = isIncome ? '#1b6d24' : '#ba1a1a'
        const amountColor = isIncome ? '#1b6d24' : '#191c1d'
        const iconFile = isIncome ? '/figma/container-5.svg' : '/figma/container-6.svg'
        const isLast = index === transactions.length - 1

        return (
          <div
            key={t.id}
            className="relative flex items-center justify-between px-4 py-4 group hover:bg-[#f8f9fa] transition"
            style={{
              borderBottom: isLast ? 'none' : '1px solid #d0c5af',
            }}
          >
            {/* Left colored bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ backgroundColor: barColor }}
            />

            {/* Left side: icon + name */}
            <div className="flex items-center gap-4 pl-2">
              <img src={iconFile} alt={isIncome ? 'income' : 'expense'} width={12} height={12} />
              <p className="text-base" style={{ color: '#191c1d' }}>{t.note}</p>
            </div>

            {/* Right side: amount + date + delete */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p
                  className="text-base font-bold"
                  style={{ color: amountColor, fontFamily: 'var(--font-sans)' }}
                >
                  {isIncome ? '+' : '-'}NT${t.amount.toLocaleString('zh-TW')}
                </p>
                <p className="text-sm" style={{ color: '#5d5e61' }}>
                  {formatDate(t.date)}
                </p>
              </div>

              {!compact && (
                <button
                  onClick={() => handleDelete(t.id)}
                  className="opacity-0 group-hover:opacity-100 transition p-1 rounded"
                  aria-label="刪除"
                  style={{ color: '#ba1a1a' }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
