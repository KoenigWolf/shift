'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Plus, Home, BarChart } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">シフト管理</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>ダッシュボード</span>
              </Button>
            </Link>
            <Link href="/staff">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>スタッフ管理</span>
              </Button>
            </Link>
            <Link href="/shifts">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>シフト作成</span>
              </Button>
            </Link>
            <Link href="/calendar">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>カレンダー</span>
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost" className="flex items-center space-x-2">
                <BarChart className="h-4 w-4" />
                <span>レポート</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
