'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { Calendar, Users, Plus, Home, BarChart, ClipboardList, Sparkles } from 'lucide-react'

const pageConfig = {
  '/': {
    title: 'ダッシュボード',
    subtitle: 'シフト管理システムの概要',
    icon: Home
  },
  '/staff': {
    title: 'スタッフ管理',
    subtitle: '看護師の登録と管理',
    icon: Users
  },
  '/shifts': {
    title: 'シフト作成',
    subtitle: '新しいシフトの登録',
    icon: Plus
  },
  '/calendar': {
    title: 'カレンダー',
    subtitle: 'シフトのカレンダー表示',
    icon: Calendar
  },
  '/reports': {
    title: '勤務実績レポート',
    subtitle: '月次・スタッフ別集計',
    icon: BarChart
  },
  '/preferences': {
    title: 'シフト希望提出',
    subtitle: '勤務希望と空き時間を登録',
    icon: ClipboardList
  },
  '/shift-dashboard': {
    title: 'シフト集約ダッシュボード',
    subtitle: '希望を集約してシフトを自動生成',
    icon: Sparkles
  }
}

export function Header() {
  const pathname = usePathname()
  const currentPage = pageConfig[pathname as keyof typeof pageConfig] || pageConfig['/']
  const PageIcon = currentPage.icon

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container mx-auto px-4">
        {/* トップバー：ロゴとナビゲーション */}
        <div className="flex items-center justify-between py-2">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Calendar className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 hidden sm:inline">シフト管理</span>
          </Link>

          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Link href="/">
              <Button
                variant={pathname === '/' ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center space-x-1 sm:space-x-2"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">ダッシュボード</span>
              </Button>
            </Link>
            <Link href="/staff">
              <Button
                variant={pathname === '/staff' ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center space-x-1 sm:space-x-2"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">スタッフ</span>
              </Button>
            </Link>
            <Link href="/shifts">
              <Button
                variant={pathname === '/shifts' ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center space-x-1 sm:space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">作成</span>
              </Button>
            </Link>
            <Link href="/preferences">
              <Button
                variant={pathname === '/preferences' ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center space-x-1 sm:space-x-2"
              >
                <ClipboardList className="h-4 w-4" />
                <span className="hidden sm:inline">希望提出</span>
              </Button>
            </Link>
            <Link href="/shift-dashboard">
              <Button
                variant={pathname === '/shift-dashboard' ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center space-x-1 sm:space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">集約</span>
              </Button>
            </Link>
            <Link href="/calendar">
              <Button
                variant={pathname === '/calendar' ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center space-x-1 sm:space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">カレンダー</span>
              </Button>
            </Link>
            <NotificationCenter />
          </nav>
        </div>

      </div>
    </header>
  )
}
