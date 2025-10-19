import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * 空状態コンポーネント
 * データがない場合に表示する統一されたUI
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-16 px-4', className)}>
      <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center animate-fade-in">
        <Icon className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>}
      {action && (
        <Button onClick={action.onClick} className="shadow-lg hover:shadow-xl transition-all">
          {action.label}
        </Button>
      )}
    </div>
  )
}
