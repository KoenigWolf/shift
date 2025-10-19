import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  title: string
  description?: string
  icon: LucideIcon
  iconBgColor?: string
  gradient?: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

/**
 * セクションカードコンポーネント
 * アイコン付きヘッダーを持つカード
 */
export function SectionCard({
  title,
  description,
  icon: Icon,
  iconBgColor = 'bg-blue-500',
  gradient = 'from-white to-blue-50/30',
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={cn('p-5 border-0 shadow-xl bg-gradient-to-br', gradient, className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', iconBgColor)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className={cn(contentClassName)}>{children}</div>
    </Card>
  )
}

/**
 * セクションカードのプリセット設定
 */
export const SectionCardPresets = {
  blue: {
    iconBgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
    gradient: 'from-white to-blue-50/30',
  },
  success: {
    iconBgColor: 'bg-gradient-to-br from-green-400 to-green-600',
    gradient: 'from-white to-green-50/30',
  },
  green: {
    iconBgColor: 'bg-gradient-to-br from-green-400 to-green-600',
    gradient: 'from-white to-green-50/30',
  },
  danger: {
    iconBgColor: 'bg-gradient-to-br from-red-400 to-red-600',
    gradient: 'from-white to-red-50/30',
  },
  red: {
    iconBgColor: 'bg-gradient-to-br from-red-400 to-red-600',
    gradient: 'from-white to-red-50/30',
  },
  purple: {
    iconBgColor: 'bg-gradient-to-br from-purple-400 to-purple-600',
    gradient: 'from-white to-purple-50/30',
  },
  orange: {
    iconBgColor: 'bg-gradient-to-br from-orange-400 to-orange-600',
    gradient: 'from-white to-orange-50/30',
  },
  yellow: {
    iconBgColor: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    gradient: 'from-white to-yellow-50/30',
  },
}
