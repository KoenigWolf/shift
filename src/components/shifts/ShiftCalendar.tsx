'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ShiftWithStaff } from '@/types'

interface ShiftCalendarProps {
  shifts: ShiftWithStaff[]
  onDateSelect?: (date: Date) => void
}

export function ShiftCalendar({ shifts, onDateSelect }: ShiftCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getShiftsForDate = (date: Date) => {
    return shifts.filter(shift => isSameDay(new Date(shift.date), date))
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

  const selectedDateShifts = selectedDate ? getShiftsForDate(selectedDate) : []

  return (
    <div className="space-y-4">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {format(currentMonth, 'yyyy年MM月', { locale: ja })}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* カレンダー */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                    {day}
                  </div>
                ))}
                {daysInMonth.map((day) => {
                  const dayShifts = getShiftsForDate(day)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  const isToday = isSameDay(day, new Date())
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDateClick(day)}
                      className={`
                        relative p-2 text-sm rounded-lg transition-colors
                        ${isSelected ? 'bg-blue-100 text-blue-900' : ''}
                        ${isToday ? 'bg-blue-50 font-semibold' : ''}
                        hover:bg-gray-100
                      `}
                    >
                      <div className="text-center">{format(day, 'd')}</div>
                      {dayShifts.length > 0 && (
                        <div className="flex justify-center mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 選択日付のシフト一覧 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? format(selectedDate, 'MM月dd日', { locale: ja }) : '日付を選択'}のシフト
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateShifts.length === 0 ? (
                <p className="text-gray-500 text-sm">シフトがありません</p>
              ) : (
                <div className="space-y-2">
                  {selectedDateShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: shift.staff.color }}
                        />
                        <div>
                          <div className="font-medium text-sm">{shift.staff.name}</div>
                          <div className="text-xs text-gray-500">{shift.staff.role}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {shift.startTime} - {shift.endTime}
                        </div>
                        {shift.memo && (
                          <div className="text-xs text-gray-500">{shift.memo}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
