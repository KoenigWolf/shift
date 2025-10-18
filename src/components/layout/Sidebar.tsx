'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Plus, Home, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'ダッシュボード', href: '/', icon: Home },
  { name: 'スタッフ管理', href: '/staff', icon: Users },
  { name: 'シフト作成', href: '/shifts', icon: Plus },
  { name: 'カレンダー', href: '/calendar', icon: Calendar },
  { name: '設定', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-50 border-r min-h-screen">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-8">
          <Calendar className="h-8 w-8 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">シフト管理</h2>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isActive && 'bg-blue-600 text-white'
                  )}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
