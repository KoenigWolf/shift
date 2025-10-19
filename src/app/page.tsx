'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Staff, Shift } from '@prisma/client'
import { Users, Calendar, Clock, TrendingUp, Moon, Sun, LayoutDashboard } from 'lucide-react'
import { SHIFT_TYPES } from '@/lib/validations/shift'
import {
  CompactPageHeader,
  CompactStatCard,
  CardHeaderWithIcon,
  QuickActionButton,
  EmptyState,
  LoadingSpinner,
} from '@/components/common'

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
          const staffResult = await staffResponse.json()
          setStaff(staffResult.success ? staffResult.data : [])
        }

        if (shiftsResponse.ok) {
          const shiftsResult = await shiftsResponse.json()
          setShifts(shiftsResult.success ? shiftsResult.data : [])
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

  // 今日の夜勤シフトを取得
  const todayNightShifts = todayShifts.filter(shift =>
    shift.shiftType === '夜勤' || shift.shiftType === '深夜勤'
  )

  // 今日の日勤シフトを取得
  const todayDayShifts = todayShifts.filter(shift =>
    shift.shiftType === '日勤'
  )

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-6">
        <LoadingSpinner />
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-3 max-w-[1600px]">
      <CompactPageHeader
        title="ダッシュボード"
        description="シフト管理システムの概要"
        icon={LayoutDashboard}
        gradient="from-blue-500 to-purple-600"
      />

      <div className="space-y-4">
        {/* コンパクトな統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <CompactStatCard title="看護師数" value={staff.length} icon={Users} color="blue" delay={0} />
          <CompactStatCard title="今日の日勤" value={todayDayShifts.length} icon={Sun} color="yellow" delay={50} />
          <CompactStatCard title="今日の夜勤" value={todayNightShifts.length} icon={Moon} color="purple" delay={100} />
          <CompactStatCard title="今週のシフト" value={thisWeekShifts.length} icon={Calendar} color="green" delay={150} />
          <CompactStatCard title="総シフト数" value={shifts.length} icon={TrendingUp} color="indigo" delay={200} />
        </div>

        {/* メインコンテンツ: 2カラムレイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 今日のシフト */}
          <Card className="lg:col-span-2 shadow-lg border-0">
            <CardHeaderWithIcon title="今日のシフト" icon={Calendar} gradient="from-blue-400 to-blue-600" />
            <div className="px-4 pb-4">
              {todayShifts.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="今日のシフトはありません"
                  description="本日予定されているシフトはありません"
                  className="py-6"
                />
              ) : (
                <div className="space-y-2">
                  {todayShifts.map((shift, index) => {
                    const shiftTypeConfig = SHIFT_TYPES.find(st => st.value === shift.shiftType)
                    return (
                      <div
                        key={shift.id}
                        className="flex items-center justify-between p-2.5 border rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 animate-slide-up group"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full transition-transform duration-300 group-hover:scale-125"
                            style={{ backgroundColor: shift.staff.color }}
                          />
                          <div>
                            <span className="font-medium text-sm">{shift.staff.name}</span>
                            <div className="text-[10px] text-gray-500">{shift.staff.role}</div>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-2 transition-all duration-300 group-hover:shadow-sm"
                            style={{
                              borderColor: shiftTypeConfig?.color,
                              color: shiftTypeConfig?.color
                            }}
                          >
                            {shiftTypeConfig?.icon} {shift.shiftType}
                          </Badge>
                        </div>
                        <div className="text-[10px] text-gray-600 font-medium">
                          {shift.startTime} - {shift.endTime}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* クイックアクション */}
          <Card className="shadow-lg border-0">
            <CardHeaderWithIcon title="クイックアクション" icon={TrendingUp} gradient="from-purple-400 to-purple-600" />
            <div className="px-4 pb-4">
              <div className="space-y-2">
                <QuickActionButton
                  icon={Users}
                  label="スタッフ管理"
                  href="/staff"
                  className="h-10"
                />
                <QuickActionButton
                  icon={Calendar}
                  label="シフト作成"
                  href="/shifts"
                  className="h-10"
                />
                <QuickActionButton
                  icon={Clock}
                  label="希望提出"
                  href="/preferences"
                  variant="outline"
                  className="h-10"
                />
                <QuickActionButton
                  icon={TrendingUp}
                  label="シフト集約"
                  href="/shift-dashboard"
                  variant="outline"
                  className="h-10"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
