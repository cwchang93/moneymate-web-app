'use client'

interface StatisticsCardProps {
  title: string
  amount: number
  variant: 'income' | 'expense' | 'balance'
}

const VARIANT_CONFIG = {
  income: {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    colorClass: 'text-[color:var(--income)]',
    bgClass: 'bg-[color:var(--income-bg)]',
    label: '收入',
  },
  expense: {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    colorClass: 'text-[color:var(--expense)]',
    bgClass: 'bg-[color:var(--expense-bg)]',
    label: '支出',
  },
  balance: {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
      </svg>
    ),
    colorClass: 'text-[color:var(--balance)]',
    bgClass: 'bg-[color:var(--balance-bg)]',
    label: '結餘',
  },
}

export default function StatisticsCard({ title, amount, variant }: StatisticsCardProps) {
  const config = VARIANT_CONFIG[variant]
  const isNegative = amount < 0

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <span className={`w-8 h-8 rounded-lg ${config.bgClass} ${config.colorClass} flex items-center justify-center shrink-0`}>
          {config.icon}
        </span>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${isNegative ? 'text-[color:var(--expense)]' : config.colorClass}`}>
        {isNegative ? '-' : ''}NT${Math.abs(amount).toLocaleString('zh-TW')}
      </p>
    </div>
  )
}
