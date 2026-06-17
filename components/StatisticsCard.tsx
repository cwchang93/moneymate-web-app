'use client'

interface StatisticsCardProps {
  title: string
  amount: number
  color: 'green' | 'red' | 'blue'
}

export default function StatisticsCard({
  title,
  amount,
  color,
}: StatisticsCardProps) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
  }

  const amountColorClasses = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
  }

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-75">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${amountColorClasses[color]}`}>
        ${amount.toFixed(2)}
      </p>
    </div>
  )
}
