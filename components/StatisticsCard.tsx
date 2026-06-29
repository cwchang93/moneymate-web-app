'use client'

interface StatisticsCardProps {
  title: string
  amount: number
  variant: 'income' | 'expense' | 'balance'
}

const VARIANT_CONFIG = {
  income: {
    iconFile: '/figma/container-2.svg',
    iconBg: 'rgba(116, 197, 112, 0.20)',
    amountColor: '#1b6d24',
    borderColor: '#d0c5af',
  },
  expense: {
    iconFile: '/figma/container-3.svg',
    iconBg: '#ffdad6',
    amountColor: '#ba1a1a',
    borderColor: '#d0c5af',
  },
  balance: {
    iconFile: '/figma/container-4.svg',
    iconBg: '#d4af37',
    amountColor: '#735c00',
    borderColor: 'rgba(115, 92, 0, 0.30)',
  },
}

export default function StatisticsCard({ title, amount, variant }: StatisticsCardProps) {
  const config = VARIANT_CONFIG[variant]
  const isNegative = amount < 0

  return (
    <div
      className="rounded-lg bg-white p-6 flex flex-col justify-between"
      style={{
        border: `1px solid ${config.borderColor}`,
        boxShadow: '0px 4px 20px rgba(115, 92, 0, 0.04)',
        minHeight: 160,
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-base" style={{ color: '#5d5e61', fontFamily: 'var(--font-sans)' }}>
          {title}
        </p>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: config.iconBg }}
        >
          <img src={config.iconFile} alt="" width={9} height={9} />
        </div>
      </div>
      <p
        className="text-4xl font-bold tracking-tight"
        style={{
          color: isNegative ? '#ba1a1a' : config.amountColor,
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.01em',
          lineHeight: '44px',
        }}
      >
        {isNegative ? '-' : ''}NT${Math.abs(amount).toLocaleString('zh-TW')}
      </p>
    </div>
  )
}
