import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  gradient: string
  borderColor: string
  iconBgColor: string
  iconColor: string
  delay?: number
  className?: string
}

/**
 * 統計カードコンポーネント
 * ダッシュボードなどで使用する統計情報表示用カード
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  borderColor,
  iconBgColor,
  iconColor,
  delay = 0,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'card-elevated animate-fade-in border-l-4 hover:shadow-xl transition-all duration-300 group',
        borderColor,
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110',
              iconBgColor
            )}
          >
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>
        <div className={cn('text-3xl font-bold mb-1', gradient)}>
          {value}
        </div>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
      </CardContent>
    </Card>
  )
}

/**
 * 統計カードのプリセット設定
 */
export const StatCardPresets = {
  primary: {
    gradient: 'bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent',
    borderColor: 'border-l-blue-500',
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  success: {
    gradient: 'bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent',
    borderColor: 'border-l-green-500',
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  warning: {
    gradient: 'bg-gradient-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent',
    borderColor: 'border-l-yellow-500',
    iconBgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  danger: {
    gradient: 'bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent',
    borderColor: 'border-l-red-500',
    iconBgColor: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  purple: {
    gradient: 'bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent',
    borderColor: 'border-l-purple-500',
    iconBgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  indigo: {
    gradient: 'bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent',
    borderColor: 'border-l-indigo-500',
    iconBgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
}
