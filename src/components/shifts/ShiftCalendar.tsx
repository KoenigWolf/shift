'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Users, Moon, Sun, Clock, Sunrise } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, startOfWeek, endOfWeek, addDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ShiftWithStaff } from '@/types'
import { SHIFT_TYPES } from '@/lib/validations/shift'

interface ShiftCalendarProps {
  shifts: ShiftWithStaff[]
  onDateSelect?: (date: Date) => void
}

export function ShiftCalendar({ shifts, onDateSelect }: ShiftCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getShiftsForDate = (date: Date) => {
    return shifts.filter(shift => isSameDay(new Date(shift.date), date))
  }

  const getShiftStats = () => {
    const today = new Date()
    const todayShifts = getShiftsForDate(today)
    const dayShifts = todayShifts.filter(s => s.shiftType === '日勤').length
    const nightShifts = todayShifts.filter(s => s.shiftType === '夜勤' || s.shiftType === '深夜勤').length
    const eveningShifts = todayShifts.filter(s => s.shiftType === '準夜勤').length

    const monthShifts = shifts.filter(s => {
      const shiftDate = new Date(s.date)
      return shiftDate.getMonth() === currentMonth.getMonth() &&
             shiftDate.getFullYear() === currentMonth.getFullYear()
    })

    return { todayTotal: todayShifts.length, dayShifts, nightShifts, eveningShifts, monthTotal: monthShifts.length }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onDateSelect?.(date)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(today)
  }

  const selectedDateShifts = getShiftsForDate(selectedDate)
  const stats = getShiftStats()

  return (
    <div className="space-y-6">
      {/* ヘッダーセクション */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {format(currentMonth, 'yyyy年 M月', { locale: ja })}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {format(selectedDate, 'M月d日 (E)', { locale: ja })} のシフト詳細
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            <Clock className="h-4 w-4 mr-2" />
            今日
          </Button>
          <div className="flex items-center border rounded-lg">
            <Button variant="ghost" size="sm" onClick={goToPreviousMonth} className="rounded-r-none">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-3 py-1 text-sm font-medium border-x">
              {format(currentMonth, 'M月', { locale: ja })}
            </div>
            <Button variant="ghost" size="sm" onClick={goToNextMonth} className="rounded-l-none">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">今日の勤務</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.todayTotal}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">日勤</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.dayShifts}</p>
              </div>
              <Sun className="h-8 w-8 text-yellow-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">夜勤</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.nightShifts}</p>
              </div>
              <Moon className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">今月合計</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.monthTotal}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-0">
              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                  <div
                    key={day}
                    className={`text-center text-xs font-semibold p-3 ${
                      index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* カレンダーグリッド */}
              <div className="grid grid-cols-7 auto-rows-fr">
                {calendarDays.map((day, index) => {
                  const dayShifts = getShiftsForDate(day)
                  const isSelected = isSameDay(day, selectedDate)
                  const isToday = isSameDay(day, new Date())
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
                  const dayOfWeek = getDay(day)

                  const dayShiftCount = dayShifts.filter(s => s.shiftType === '日勤').length
                  const nightShiftCount = dayShifts.filter(s => s.shiftType === '夜勤' || s.shiftType === '深夜勤').length
                  const eveningShiftCount = dayShifts.filter(s => s.shiftType === '準夜勤').length

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDateClick(day)}
                      className={`
                        relative p-2 min-h-[100px] border-r border-b transition-all duration-200
                        ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'bg-white hover:bg-blue-50/30'}
                        ${isSelected ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset z-10' : ''}
                        ${isToday ? 'bg-yellow-50/50' : ''}
                        ${index % 7 === 6 ? 'border-r-0' : ''}
                      `}
                    >
                      {/* 日付 */}
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`
                            text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full
                            ${isToday ? 'bg-blue-600 text-white' : ''}
                            ${dayOfWeek === 0 && !isToday ? 'text-red-600' : ''}
                            ${dayOfWeek === 6 && !isToday ? 'text-blue-600' : ''}
                            ${!isCurrentMonth && !isToday ? 'text-gray-400' : ''}
                          `}
                        >
                          {format(day, 'd')}
                        </span>
                        {dayShifts.length > 0 && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                            {dayShifts.length}
                          </span>
                        )}
                      </div>

                      {/* シフトインジケーター */}
                      <div className="space-y-1">
                        {dayShiftCount > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                            <span className="text-gray-700 font-medium">日勤 {dayShiftCount}</span>
                          </div>
                        )}
                        {eveningShiftCount > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                            <span className="text-gray-700 font-medium">準夜 {eveningShiftCount}</span>
                          </div>
                        )}
                        {nightShiftCount > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                            <span className="text-gray-700 font-medium">夜勤 {nightShiftCount}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* シフト詳細パネル */}
        <div className="xl:col-span-1">
          <Card className="sticky top-4 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">
                  {format(selectedDate, 'M月d日', { locale: ja })}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {format(selectedDate, '(E)', { locale: ja })}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {selectedDateShifts.length}件のシフト
              </p>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
              {selectedDateShifts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">シフトがありません</p>
                </div>
              ) : (
                selectedDateShifts.map((shift) => {
                  const shiftTypeConfig = SHIFT_TYPES.find(st => st.value === shift.shiftType)
                  return (
                    <div
                      key={shift.id}
                      className="group p-4 border rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50"
                    >
                      {/* スタッフ情報 */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                            style={{ backgroundColor: shift.staff.color }}
                          >
                            {shift.staff.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{shift.staff.name}</div>
                            <div className="text-xs text-gray-500">{shift.staff.role}</div>
                          </div>
                        </div>
                        <Badge
                          className="text-xs font-semibold"
                          style={{
                            backgroundColor: `${shiftTypeConfig?.color}20`,
                            color: shiftTypeConfig?.color,
                            borderColor: shiftTypeConfig?.color
                          }}
                        >
                          {shiftTypeConfig?.icon} {shift.shiftType}
                        </Badge>
                      </div>

                      {/* 時間情報 */}
                      <div className="flex items-center gap-4 text-sm mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {shift.startTime} - {shift.endTime}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          休憩 {shift.breakTime}分
                        </div>
                      </div>

                      {/* メモ */}
                      {shift.memo && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {shift.memo}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* レジェンド */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span className="text-sm font-medium text-gray-700">日勤</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              <span className="text-sm font-medium text-gray-700">準夜勤</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-400"></div>
              <span className="text-sm font-medium text-gray-700">夜勤・深夜勤</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                {format(new Date(), 'd')}
              </div>
              <span className="text-sm font-medium text-gray-700">今日</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
