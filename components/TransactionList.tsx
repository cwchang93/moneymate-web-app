'use client'

import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
}

interface TransactionListProps {
  transactions: Transaction[]
  onTransactionDeleted: () => void
}

export default function TransactionList({
  transactions,
  onTransactionDeleted,
}: TransactionListProps) {
  const handleDelete = async (id: string) => {
    if (confirm('確定要刪除這筆交易嗎？')) {
      try {
        const { error } = await supabase.from('transactions').delete().eq('id', id)
        if (error) throw error
        onTransactionDeleted()
      } catch (error) {
        console.error('Error deleting transaction:', error)
      }
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">還沒有交易記錄。開始添加您的第一筆交易吧！</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-100 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              日期
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              說明
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              分類
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
              金額
            </th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr
              key={transaction.id}
              className="border-b border-slate-200 hover:bg-slate-50 transition"
            >
              <td className="px-6 py-4 text-sm text-slate-600">
                {new Date(transaction.date).toLocaleDateString('zh-TW')}
              </td>
              <td className="px-6 py-4 text-sm text-slate-900">
                {transaction.description}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                  {transaction.category}
                </span>
              </td>
              <td
                className={`px-6 py-4 text-sm font-semibold text-right ${
                  transaction.type === 'income'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(
                  2
                )}
              </td>
              <td className="px-6 py-4 text-center">
                <Button
                  onClick={() => handleDelete(transaction.id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1"
                >
                  刪除
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
