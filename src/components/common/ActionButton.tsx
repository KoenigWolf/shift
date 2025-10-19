import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'

interface ActionButtonProps extends React.ComponentProps<typeof Button> {
  icon: LucideIcon
  label: string
  href?: string
  gradient?: boolean
  iconPosition?: 'left' | 'right'
}

/**
 * アクションボタンコンポーネント
 * アイコン付きの統一されたボタン
 */
export function ActionButton({
  icon: Icon,
  label,
  href,
  gradient = false,
  iconPosition = 'left',
  className,
  ...props
}: ActionButtonProps) {
  const buttonContent = (
    <Button
      className={cn(
        'group transition-all duration-300',
        gradient &&
          'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
        className
      )}
      {...props}
    >
      {iconPosition === 'left' && (
        <Icon className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
      )}
      {label}
      {iconPosition === 'right' && (
        <Icon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
      )}
    </Button>
  )

  if (href) {
    return <Link href={href}>{buttonContent}</Link>
  }

  return buttonContent
}

/**
 * クイックアクションボタン（ナビゲーション用）
 */
export function QuickActionButton({
  icon: Icon,
  label,
  href,
  variant = 'default',
  className,
}: {
  icon: LucideIcon
  label: string
  href: string
  variant?: 'default' | 'outline'
  className?: string
}) {
  return (
    <Link href={href}>
      <Button
        className={cn(
          'w-full justify-start h-11 group transition-all duration-300 hover:shadow-md',
          className
        )}
        size="default"
        variant={variant}
      >
        <Icon className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
        {label}
      </Button>
    </Link>
  )
}
