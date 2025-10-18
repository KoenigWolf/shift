'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Staff, Shift } from '@prisma/client'
import { Users, Calendar, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

type ShiftWithStaff = Shift & {
  staff: Staff
}

export default function DashboardPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [shifts, setShifts] = useState<ShiftWithStaff[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffResponse, shiftsResponse] = await Promise.all([
          fetch('/api/staff'),
          fetch('/api/shifts')
        ])

        if (staffResponse.ok) {
          const staffData = await staffResponse.json()
          setStaff(staffData)
        }

        if (shiftsResponse.ok) {
          const shiftsData = await shiftsResponse.json()
          setShifts(shiftsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 今週のシフトを取得
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const thisWeekShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.date)
    return shiftDate >= startOfWeek && shiftDate <= endOfWeek
  })

  // 今日のシフトを取得
  const todayShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.date)
    return shiftDate.toDateString() === today.toDateString()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
            <p className="text-gray-600">シフト管理システムの概要</p>
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">総スタッフ数</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staff.length}</div>
                <p className="text-xs text-muted-foreground">
                  登録済みスタッフ
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今週のシフト</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{thisWeekShifts.length}</div>
                <p className="text-xs text-muted-foreground">
                  今週の予定
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今日のシフト</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayShifts.length}</div>
                <p className="text-xs text-muted-foreground">
                  今日の予定
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">総シフト数</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shifts.length}</div>
                <p className="text-xs text-muted-foreground">
                  全期間のシフト
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 今日のシフト */}
          <Card>
            <CardHeader>
              <CardTitle>今日のシフト</CardTitle>
            </CardHeader>
            <CardContent>
              {todayShifts.length === 0 ? (
                <p className="text-gray-500">今日のシフトはありません</p>
              ) : (
                <div className="space-y-2">
                  {todayShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: shift.staff.color }}
                        />
                        <span className="font-medium">{shift.staff.name}</span>
                        <Badge variant="secondary">{shift.staff.role}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {shift.startTime} - {shift.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* クイックアクション */}
          <Card>
            <CardHeader>
              <CardTitle>クイックアクション</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/staff">
                  <Button className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    スタッフ管理
                  </Button>
                </Link>
                <Link href="/shifts">
                  <Button className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    シフト作成
                  </Button>
                </Link>
                <Link href="/calendar">
                  <Button className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    カレンダー表示
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
