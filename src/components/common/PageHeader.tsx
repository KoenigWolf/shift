import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  gradient?: string
  actions?: React.ReactNode
  className?: string
}

/**
 * ページヘッダーコンポーネント
 * ページのタイトルと説明を表示する統一されたヘッダー
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  gradient = 'from-blue-500 via-purple-500 to-pink-500',
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 p-8 rounded-2xl bg-gradient-to-br text-white shadow-xl animate-fade-in',
        gradient,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon className="h-8 w-8 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold mb-1">{title}</h1>
            {description && <p className="text-white/90">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}

/**
 * シンプルなページヘッダー（グラデーション背景なし）
 */
export function SimplePageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex items-center justify-between', className)}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h1>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
