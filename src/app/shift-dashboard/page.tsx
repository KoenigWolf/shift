'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  CalendarIcon,
  Users,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import {
  CompactPageHeader,
  CompactStatCard,
  CardHeaderWithIcon,
  EmptyState,
  ActionButton,
} from '@/components/common'

interface Staff {
  id: string
  name: string
  role: string
  color: string
}

interface ShiftPreference {
  id: string
  staffId: string
  targetMonth: string
  preferredShifts: string
  notPreferred: string | null
  maxDaysPerWeek: number | null
  comment: string | null
  status: string
  submittedAt: string
  staff: Staff
}

interface Availability {
  id: string
  staffId: string
  date: string
  isAvailable: boolean
  unavailableReason: string | null
  priority: number
  staff: Staff
}

export default function ShiftDashboardPage() {
  const [targetMonth, setTargetMonth] = useState<Date>(new Date())
  const [preferences, setPreferences] = useState<ShiftPreference[]>([])
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)

  useEffect(() => {
    fetchPreferences()
    fetchAvailabilities()
  }, [targetMonth])

  const fetchPreferences = async () => {
    try {
      const monthStr = format(startOfMonth(targetMonth), 'yyyy-MM-dd')
      const response = await fetch(`/api/preferences?targetMonth=${monthStr}T00:00:00.000Z`)
      const result = await response.json()
      if (result.success) {
        setPreferences(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
      toast.error('希望シフトの取得に失敗しました')
    }
  }

  const fetchAvailabilities = async () => {
    try {
      const start = format(startOfMonth(targetMonth), 'yyyy-MM-dd')
      const end = format(endOfMonth(targetMonth), 'yyyy-MM-dd')
      const response = await fetch(
        `/api/availabilities?startDate=${start}T00:00:00.000Z&endDate=${end}T23:59:59.999Z`
      )
      const result = await response.json()
      if (result.success) {
        setAvailabilities(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch availabilities:', error)
      toast.error('勤務可能日時の取得に失敗しました')
    }
  }

  const getUnavailableStaffForDate = (date: Date) => {
    return availabilities.filter(
      (avail) => !avail.isAvailable && isSameDay(parseISO(avail.date), date)
    )
  }

  const getAvailableCountForDate = (date: Date) => {
    const unavailableCount = availabilities.filter(
      (avail) => !avail.isAvailable && isSameDay(parseISO(avail.date), date)
    ).length
    const totalStaff = new Set(preferences.map((p) => p.staffId)).size
    return totalStaff - unavailableCount
  }

  const shiftTypeSummary = () => {
    const summary: Record<string, number> = {}
    preferences.forEach((pref) => {
      const shifts = JSON.parse(pref.preferredShifts) as string[]
      shifts.forEach((shift) => {
        summary[shift] = (summary[shift] || 0) + 1
      })
    })
    return summary
  }

  const notPreferredSummary = () => {
    const summary: Record<string, number> = {}
    preferences.forEach((pref) => {
      if (pref.notPreferred) {
        const shifts = JSON.parse(pref.notPreferred) as string[]
        shifts.forEach((shift) => {
          summary[shift] = (summary[shift] || 0) + 1
        })
      }
    })
    return summary
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(targetMonth),
    end: endOfMonth(targetMonth),
  })

  const criticalDays = daysInMonth.filter((day) => {
    const availableCount = getAvailableCountForDate(day)
    return availableCount < 3 // 勤務可能人数が3人未満
  })

  const summary = shiftTypeSummary()
  const notPreferredSum = notPreferredSummary()

  const handleGenerateShifts = async () => {
    if (preferences.length === 0) {
      toast.error('希望シフトの提出がありません')
      return
    }

    setIsGenerating(true)

    try {
      const shiftTemplates = [
        {
          shiftType: '日勤',
          startTime: '09:00',
          endTime: '18:00',
          breakTime: 60,
          requiredCount: 5,
        },
        {
          shiftType: '夜勤',
          startTime: '17:00',
          endTime: '09:00',
          breakTime: 60,
          requiredCount: 3,
        },
      ]

      const response = await fetch('/api/shifts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetMonth: startOfMonth(targetMonth).toISOString(),
          minStaffPerShift: 2,
          maxStaffPerShift: 8,
          prioritizePreferences: true,
          balanceWorkload: true,
          shiftTemplates,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(
          `シフトを自動生成しました（${result.data.shifts.length}件）\n希望一致率: ${result.data.summary.preferenceMatchRate.toFixed(1)}%`
        )
        setShowGenerateDialog(false)

        // 警告がある場合は表示
        if (result.data.summary.warnings.length > 0) {
          result.data.summary.warnings.forEach((warning: string) => {
            toast.warning(warning)
          })
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Failed to generate shifts:', error)
      toast.error('シフトの自動生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-3 max-w-[1600px]">
      <CompactPageHeader
        title="シフト希望集約"
        description="スタッフの希望を一覧化"
        icon={TrendingUp}
        gradient="from-indigo-500 to-purple-600"
        actions={
          <div className="flex gap-2 w-full sm:w-auto">
            <ActionButton
              icon={RefreshCw}
              label="更新"
              variant="outline"
              size="sm"
              onClick={fetchPreferences}
              className="shadow-sm hover:shadow-md h-9 flex-1 sm:flex-none"
            />
            <ActionButton
              icon={Sparkles}
              label={isGenerating ? '生成中...' : '自動生成'}
              gradient
              size="sm"
              onClick={handleGenerateShifts}
              disabled={isGenerating || preferences.length === 0}
              className="h-9 flex-1 sm:flex-none"
            />
          </div>
        }
      />

      <div className="space-y-4">
        {/* コンパクトなサマリーカード */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <CompactStatCard title="提出済み" value={preferences.length} icon={Users} color="blue" delay={0} />
          <CompactStatCard title="日勤希望" value={summary['日勤'] || 0} icon={TrendingUp} color="yellow" delay={50} />
          <CompactStatCard title="夜勤希望" value={summary['夜勤'] || 0} icon={CalendarIcon} color="purple" delay={100} />
          <CompactStatCard title="要注意日" value={criticalDays.length} icon={AlertCircle} color="red" delay={150} />
        </div>

        {/* 2カラムレイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 左カラム: 希望シフト一覧 */}
          <Card className="p-0 shadow-lg border-0">
            <CardHeaderWithIcon title="スタッフ別希望シフト" icon={Users} gradient="from-green-400 to-green-600" />
            <div className="px-4 pb-4">
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {preferences.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="希望シフトの提出がありません"
                  description="まだ提出されたシフト希望がありません"
                  className="py-8"
                />
              ) : (
                preferences.map((pref, index) => {
                  const preferred = JSON.parse(pref.preferredShifts) as string[]
                  const notPref = pref.notPreferred
                    ? (JSON.parse(pref.notPreferred) as string[])
                    : []

                  return (
                    <Card
                      key={pref.id}
                      className="p-3 shadow-sm hover:shadow-md transition-all duration-200 animate-slide-up border-l-2 border-l-green-500"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-7 w-7 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm"
                            style={{ backgroundColor: pref.staff.color }}
                          >
                            {pref.staff.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{pref.staff.name}</p>
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 mt-0.5">
                              {pref.staff.role}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(pref.submittedAt), 'M/d HH:mm')}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] text-gray-600 font-medium min-w-fit">✓ 希望:</span>
                          {preferred.map((shift) => (
                            <Badge
                              key={shift}
                              className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 text-[10px] h-5 px-2"
                            >
                              {shift}
                            </Badge>
                          ))}
                        </div>

                        {notPref.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="text-[10px] text-gray-600 font-medium min-w-fit">✕ 非希望:</span>
                            {notPref.map((shift) => (
                              <Badge
                                key={shift}
                                className="bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-0 text-[10px] h-5 px-2"
                              >
                                {shift}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 text-[10px]">
                          {pref.maxDaysPerWeek && (
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                              週最大{pref.maxDaysPerWeek}日
                            </span>
                          )}
                          {pref.comment && (
                            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              コメントあり
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
            </div>
          </Card>

          {/* 右カラム: 日別勤務不可スタッフとカレンダー */}
          <div className="space-y-3">
            <Card className="p-0 shadow-lg border-0">
              <CardHeaderWithIcon title="日別勤務不可スタッフ" icon={CalendarIcon} gradient="from-purple-400 to-purple-600" />
              <div className="px-4 pb-4">

              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ja}
                className="rounded-lg border shadow-sm bg-white p-2 mx-auto scale-90"
                modifiers={{
                  unavailable: (date) => {
                    const unavailableStaff = getUnavailableStaffForDate(date)
                    return unavailableStaff.length > 0
                  },
                  critical: criticalDays,
                }}
                modifiersStyles={{
                  unavailable: {
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                  },
                  critical: {
                    backgroundColor: '#fee2e2',
                    fontWeight: 'bold',
                    color: '#991b1b',
                  },
                }}
              />

              {selectedDate && (
                <div className="mt-2 p-3 rounded-lg bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200">
                  <p className="text-xs font-bold mb-2 text-gray-800">
                    {format(selectedDate, 'M月d日 (E)', { locale: ja })}
                  </p>

                  <div className="space-y-1.5">
                    {getUnavailableStaffForDate(selectedDate).map((avail) => (
                      <div
                        key={avail.id}
                        className="p-2 bg-white rounded border border-red-100 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 w-6 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
                            style={{ backgroundColor: avail.staff.color }}
                          >
                            {avail.staff.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-xs">{avail.staff.name}</p>
                            {avail.unavailableReason && (
                              <p className="text-[10px] text-gray-600">{avail.unavailableReason}</p>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-red-500 text-white border-0 text-[10px] h-4 px-1.5">
                          不可
                        </Badge>
                      </div>
                    ))}

                    {getUnavailableStaffForDate(selectedDate).length === 0 && (
                      <div className="text-center py-4">
                        <div className="h-10 w-10 mx-auto mb-1.5 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="text-gray-600 text-xs font-medium">全員勤務可能</p>
                      </div>
                    )}

                    <div className="mt-2 p-2 bg-white rounded border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700 text-xs">勤務可能</span>
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                          {getAvailableCountForDate(selectedDate)}名
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </Card>

            {/* 要注意日 - グリッド表示でコンパクトに */}
            {criticalDays.length > 0 && (
              <Card className="p-0 shadow-lg border-0 bg-gradient-to-br from-white to-red-50/30">
                <CardHeaderWithIcon title="要注意日（人員不足）" icon={AlertCircle} gradient="from-red-400 to-red-600" className="text-red-700" />
                <div className="px-4 pb-4">
                {/* 2列グリッド表示でコンパクトに */}
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                  {criticalDays.map((day, index) => (
                    <div
                      key={day.toISOString()}
                      className="p-2 bg-white rounded-lg shadow-sm flex flex-col hover:shadow-md transition-all duration-200 animate-slide-up"
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      <p className="font-semibold text-gray-800 text-xs mb-1">
                        {format(day, 'M/d (E)', { locale: ja })}
                      </p>
                      <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 text-[10px] h-5 w-fit">
                        {getAvailableCountForDate(day)}名のみ
                      </Badge>
                    </div>
                  ))}
                </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
