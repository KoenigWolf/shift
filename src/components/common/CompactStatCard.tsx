import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CompactStatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: 'blue' | 'yellow' | 'purple' | 'green' | 'orange' | 'red' | 'indigo'
  delay?: number
  className?: string
}

/**
 * コンパクト統計カードコンポーネント
 * 横並びレイアウトで情報密度を高めた統計表示用カード
 */
export function CompactStatCard({
  title,
  value,
  icon: Icon,
  color,
  delay = 0,
  className,
}: CompactStatCardProps) {
  const colorClasses = {
    blue: {
      border: 'border-l-blue-500',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-600',
    },
    yellow: {
      border: 'border-l-yellow-500',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      valueColor: 'text-yellow-600',
    },
    purple: {
      border: 'border-l-purple-500',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      valueColor: 'text-purple-600',
    },
    green: {
      border: 'border-l-green-500',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
    },
    orange: {
      border: 'border-l-orange-500',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      valueColor: 'text-orange-600',
    },
    red: {
      border: 'border-l-red-500',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600',
    },
    indigo: {
      border: 'border-l-indigo-500',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      valueColor: 'text-indigo-600',
    },
  }

  const colors = colorClasses[color]

  return (
    <Card
      className={cn(
        'p-3 shadow-md hover:shadow-lg transition-all duration-200 border-l-4 animate-fade-in',
        colors.border,
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2.5">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colors.iconBg)}>
          <Icon className={cn('h-4 w-4', colors.iconColor)} />
        </div>
        <div>
          <div className={cn('text-2xl font-bold', colors.valueColor)}>{value}</div>
          <p className="text-xs text-gray-600">{title}</p>
        </div>
      </div>
    </Card>
  )
}
