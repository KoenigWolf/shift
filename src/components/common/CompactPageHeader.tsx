import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompactPageHeaderProps {
  title: string
  description?: string
  icon: LucideIcon
  gradient?: string
  actions?: React.ReactNode
  className?: string
}

/**
 * コンパクトページヘッダーコンポーネント
 * ページタイトルとアクションボタンを含むヘッダー
 */
export function CompactPageHeader({
  title,
  description,
  icon: Icon,
  gradient = 'from-blue-500 to-purple-600',
  actions,
  className,
}: CompactPageHeaderProps) {
  return (
    <div className={cn('mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-3">
        <div className={cn('h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-md', gradient)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          {description && (
            <p className="text-xs text-gray-500 hidden sm:block">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="w-full sm:w-auto">{actions}</div>}
    </div>
  )
}
