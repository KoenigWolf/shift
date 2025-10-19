import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CardHeaderWithIconProps {
  title: string
  icon: LucideIcon
  gradient?: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

/**
 * アイコン付きカードヘッダーコンポーネント
 * カード内のセクションヘッダーとして使用
 */
export function CardHeaderWithIcon({
  title,
  icon: Icon,
  gradient = 'from-blue-400 to-blue-600',
  subtitle,
  actions,
  className,
}: CardHeaderWithIconProps) {
  return (
    <div className={cn('flex items-center justify-between mb-3 pb-2 border-b px-4 pt-4', className)}>
      <div className="flex items-center gap-2 flex-1">
        <div className={cn('h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center', gradient)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  )
}
