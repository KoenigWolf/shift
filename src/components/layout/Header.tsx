'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Plus, Home, BarChart } from 'lucide-react'

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
  }
}

export function Header() {
  const pathname = usePathname()
  const currentPage = pageConfig[pathname as keyof typeof pageConfig] || pageConfig['/']
  const PageIcon = currentPage.icon

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        {/* トップバー：ロゴとナビゲーション */}
        <div className="flex items-center justify-between py-3">
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
            <Link href="/reports">
              <Button
                variant={pathname === '/reports' ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center space-x-1 sm:space-x-2"
              >
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">レポート</span>
              </Button>
            </Link>
          </nav>
        </div>

        {/* ページタイトルバー */}
        <div className="flex items-center space-x-3 py-3 border-t">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
            <PageIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
              {currentPage.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{currentPage.subtitle}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
