'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { format, startOfMonth, isSameDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CalendarIcon, CheckCircle2, Send, ArrowLeft, User, MessageSquare, X } from 'lucide-react'
import Link from 'next/link'

// ========================================
// 型定義
// ========================================
interface Staff {
  id: string
  name: string
  role: string
}

interface UnavailableDate {
  date: Date
  isAvailable: boolean
  reason?: string
  priority: number
}

interface PreferenceFormData {
  staffId: string
  targetMonth: string
  preferredShifts: string[]
  notPreferred?: string[]
  maxDaysPerWeek: number
  comment?: string
  status: string
}

interface AvailabilityData {
  staffId: string
  availabilities: Array<{
    date: string
    isAvailable: boolean
    unavailableReason?: string
    priority: number
  }>
}

// ========================================
// 定数
// ========================================
const SHIFT_TYPES = ['日勤', '夜勤', '準夜勤', '深夜勤'] as const
const UNAVAILABLE_REASONS = ['私用', '通院', '学校行事', '家族の用事', 'その他'] as const
const MAX_DAYS_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const

const SHIFT_TYPE_COLORS: Record<string, string> = {
  '日勤': 'from-yellow-400 to-orange-500',
  '夜勤': 'from-purple-500 to-indigo-600',
  '準夜勤': 'from-blue-400 to-cyan-500',
  '深夜勤': 'from-indigo-500 to-purple-700',
}

// ========================================
// API関数
// ========================================
const api = {
  async fetchStaff(): Promise<Staff[]> {
    const response = await fetch('/api/staff')
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'スタッフ情報の取得に失敗しました')
    }
    
    return result.data
  },

  async submitPreference(data: PreferenceFormData): Promise<void> {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'シフト希望の登録に失敗しました')
    }
  },

  async submitAvailabilities(data: AvailabilityData): Promise<void> {
    const response = await fetch('/api/availabilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || '勤務不可日の登録に失敗しました')
    }
  },
}

// ========================================
// ユーティリティ関数
// ========================================
const formatDateJa = (date: Date, formatStr: string): string => {
  return format(date, formatStr, { locale: ja })
}

const validatePreferenceForm = (
  selectedStaff: string,
  preferredShifts: string[]
): string | null => {
  if (!selectedStaff) {
    return 'スタッフを選択してください'
  }

  if (preferredShifts.length === 0) {
    return '希望するシフトを1つ以上選択してください'
  }

  return null
}

// ========================================
// カスタムフック
// ========================================
const useStaffList = () => {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await api.fetchStaff()
        setStaffList(data)
        setError(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'スタッフ情報の取得に失敗しました'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { staffList, isLoading, error }
}

const usePreferencesForm = () => {
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [targetMonth] = useState<Date>(new Date())
  const [preferredShifts, setPreferredShifts] = useState<string[]>([])
  const [notPreferred, setNotPreferred] = useState<string[]>([])
  const [maxDaysPerWeek, setMaxDaysPerWeek] = useState<number>(5)
  const [comment, setComment] = useState<string>('')
  const [selectedDates, setSelectedDates] = useState<UnavailableDate[]>([])
  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined)

  const togglePreferredShift = (shift: string) => {
    setPreferredShifts((prev) =>
      prev.includes(shift) ? prev.filter((s) => s !== shift) : [...prev, shift]
    )
  }

  const toggleNotPreferred = (shift: string) => {
    setNotPreferred((prev) =>
      prev.includes(shift) ? prev.filter((s) => s !== shift) : [...prev, shift]
    )
  }

  const addUnavailableDate = (reason: string) => {
    if (!currentDate) return

    const existing = selectedDates.find((d) => isSameDay(d.date, currentDate))
    
    if (existing) {
      setSelectedDates((prev) =>
        prev.map((d) =>
          isSameDay(d.date, currentDate)
            ? { ...d, isAvailable: false, reason, priority: 100 }
            : d
        )
      )
    } else {
      setSelectedDates((prev) => [
        ...prev,
        { date: currentDate, isAvailable: false, reason, priority: 100 },
      ])
    }
    
    toast.success(`${formatDateJa(currentDate, 'M月d日')}を勤務不可に設定しました`)
    setCurrentDate(undefined)
  }

  const removeDate = (date: Date) => {
    setSelectedDates((prev) => prev.filter((d) => !isSameDay(d.date, date)))
  }

  const resetForm = () => {
    setPreferredShifts([])
    setNotPreferred([])
    setComment('')
    setSelectedDates([])
    setCurrentDate(undefined)
  }

  const getFormData = (): { preference: PreferenceFormData; availability?: AvailabilityData } => {
    const preferenceData: PreferenceFormData = {
      staffId: selectedStaff,
      targetMonth: startOfMonth(targetMonth).toISOString(),
      preferredShifts,
      notPreferred: notPreferred.length > 0 ? notPreferred : undefined,
      maxDaysPerWeek,
      comment: comment || undefined,
      status: '提出済み',
    }

    const availabilityData: AvailabilityData | undefined =
      selectedDates.length > 0
        ? {
            staffId: selectedStaff,
            availabilities: selectedDates.map((d) => ({
              date: d.date.toISOString(),
              isAvailable: d.isAvailable,
              unavailableReason: d.reason,
              priority: d.priority,
            })),
          }
        : undefined

    return { preference: preferenceData, availability: availabilityData }
  }

  return {
    selectedStaff,
    setSelectedStaff,
    targetMonth,
    preferredShifts,
    notPreferred,
    maxDaysPerWeek,
    setMaxDaysPerWeek,
    comment,
    setComment,
    selectedDates,
    currentDate,
    setCurrentDate,
    togglePreferredShift,
    toggleNotPreferred,
    addUnavailableDate,
    removeDate,
    resetForm,
    getFormData,
  }
}

const usePreferenceSubmit = (formState: ReturnType<typeof usePreferencesForm>) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {
    // バリデーション
    const validationError = validatePreferenceForm(
      formState.selectedStaff,
      formState.preferredShifts
    )
    
    if (validationError) {
      toast.error(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      const { preference, availability } = formState.getFormData()

      // シフト希望を登録
      await api.submitPreference(preference)

      // 勤務不可日を登録
      if (availability) {
        await api.submitAvailabilities(availability)
      }

      toast.success('シフト希望を提出しました')
      formState.resetForm()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'シフト希望の提出に失敗しました'
      console.error('Failed to submit preferences:', error)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { submit, isSubmitting }
}

// ========================================
// UIコンポーネント
// ========================================
interface SectionHeaderProps {
  icon: React.ReactNode
  title: string
  description?: string
  bgColor: string
}

const SectionHeader = ({ icon, title, description, bgColor }: SectionHeaderProps) => (
  <div className="flex items-center gap-3 mb-4">
    <div className={`h-10 w-10 rounded-xl ${bgColor} flex items-center justify-center`}>
      {icon}
    </div>
    <div className="flex-1">
      <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
  </div>
)

interface ShiftTypeCardProps {
  shift: string
  isSelected: boolean
  onToggle: () => void
  showCheckbox?: boolean
}

const ShiftTypeCard = ({ shift, isSelected, onToggle, showCheckbox = false }: ShiftTypeCardProps) => {
  // 希望するシフト用（グラデーション背景）
  if (!showCheckbox) {
    return (
      <div
        onClick={onToggle}
        className={`
          relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
          ${isSelected
            ? `border-green-500 bg-gradient-to-br ${SHIFT_TYPE_COLORS[shift]} shadow-md scale-105`
            : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-800'}`}>
            {shift}
          </span>
          <div
            className={`
              h-5 w-5 rounded-full border-2 flex items-center justify-center
              ${isSelected ? 'border-white bg-white/30' : 'border-gray-300'}
            `}
          >
            {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
          </div>
        </div>
      </div>
    )
  }

  // 希望しないシフト用（赤系統の色）
  return (
    <div
      onClick={onToggle}
      className={`
        relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
        ${isSelected
          ? 'border-red-500 bg-gradient-to-br from-red-100 to-red-200 shadow-md scale-105'
          : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <span className={`font-semibold text-sm ${isSelected ? 'text-red-700' : 'text-gray-800'}`}>
          {shift}
        </span>
        <div
          className={`
            h-5 w-5 rounded-full border-2 flex items-center justify-center
            ${isSelected ? 'border-red-600 bg-red-500' : 'border-gray-300'}
          `}
        >
          {isSelected && <X className="h-3.5 w-3.5 text-white" />}
        </div>
      </div>
    </div>
  )
}

interface UnavailableDateListProps {
  dates: UnavailableDate[]
  onRemove: (date: Date) => void
}

const UnavailableDateList = ({ dates, onRemove }: UnavailableDateListProps) => {
  if (dates.length === 0) return null

  const sortedDates = [...dates].sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <Card className="p-6 border-0 shadow-xl bg-white">
      <h3 className="text-lg font-bold text-gray-800 mb-4">選択した勤務不可日</h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {sortedDates.map((item) => (
          <div
            key={item.date.toISOString()}
            className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-2 border-red-200"
          >
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {formatDateJa(item.date, 'M月d日 (E)')}
              </p>
              {item.reason && <p className="text-xs text-red-600 mt-1">{item.reason}</p>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.date)}
              className="hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}

interface PageHeaderProps {
  title: string
  description: string
  backLink: string
}

const PageHeader = ({ title, description, backLink }: PageHeaderProps) => (
  <div className="mb-6">
    <div className="flex items-center gap-4 mb-2">
      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
        <CalendarIcon className="h-6 w-6 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  </div>
)

interface StaffSelectionCardProps {
  staffList: Staff[]
  selectedStaff: string
  onStaffChange: (staffId: string) => void
  maxDaysPerWeek: number
  onMaxDaysChange: (days: number) => void
}

const StaffSelectionCard = ({
  staffList,
  selectedStaff,
  onStaffChange,
  maxDaysPerWeek,
  onMaxDaysChange,
}: StaffSelectionCardProps) => (
  <Card className="p-5 border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30 overflow-visible">
    <SectionHeader
      icon={<User className="h-5 w-5 text-white" />}
      title="基本情報"
      bgColor="bg-blue-500"
    />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="staff" className="text-sm font-semibold text-gray-700 mb-2 block">
          スタッフ選択
        </Label>
        <Select value={selectedStaff} onValueChange={onStaffChange}>
          <SelectTrigger id="staff" className="h-11 bg-white border-2 border-gray-200 hover:border-blue-400 transition">
            <SelectValue placeholder="スタッフを選択" />
          </SelectTrigger>
          <SelectContent position="popper" className="z-50">
            {staffList.map((staff) => (
              <SelectItem key={staff.id} value={staff.id}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{staff.name}</span>
                  <span className="text-xs text-gray-500">({staff.role})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
          週あたり最大勤務日数
        </Label>
        <div className="flex items-center gap-2">
          {MAX_DAYS_OPTIONS.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onMaxDaysChange(num)}
              className={`
                flex-1 h-11 rounded-lg border-2 font-semibold transition-all duration-200 text-sm
                ${maxDaysPerWeek === num
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-md scale-105'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:shadow-sm'
                }
              `}
            >
              {num}日
            </button>
          ))}
        </div>
      </div>
    </div>
  </Card>
)

// ========================================
// メインコンポーネント
// ========================================
export default function PreferencesPage() {
  const { staffList, isLoading: isLoadingStaff } = useStaffList()
  const formState = usePreferencesForm()
  const { submit, isSubmitting } = usePreferenceSubmit(formState)

  return (
    <main className="container mx-auto py-6 px-4 max-w-[1400px]">
      <PageHeader
        title="シフト希望提出"
        description="希望するシフトタイプと勤務できない日を選択してください"
        backLink="/"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左カラム: 基本情報とシフト選択 */}
        <div className="lg:col-span-2 space-y-6">
          {/* スタッフ選択 */}
          <StaffSelectionCard
            staffList={staffList}
            selectedStaff={formState.selectedStaff}
            onStaffChange={formState.setSelectedStaff}
            maxDaysPerWeek={formState.maxDaysPerWeek}
            onMaxDaysChange={formState.setMaxDaysPerWeek}
          />

          {/* 希望シフトタイプ - 横並び */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 希望するシフト */}
            <Card className="p-5 border-0 shadow-xl bg-gradient-to-br from-white to-green-50/30">
              <SectionHeader
                icon={<CheckCircle2 className="h-5 w-5 text-white" />}
                title="希望するシフト"
                bgColor="bg-green-500"
              />

              <div className="space-y-2">
                {SHIFT_TYPES.map((shift) => (
                  <ShiftTypeCard
                    key={shift}
                    shift={shift}
                    isSelected={formState.preferredShifts.includes(shift)}
                    onToggle={() => formState.togglePreferredShift(shift)}
                  />
                ))}
              </div>
            </Card>

            {/* 希望しないシフト */}
            <Card className="p-5 border-0 shadow-xl bg-gradient-to-br from-white to-red-50/30">
              <SectionHeader
                icon={<X className="h-5 w-5 text-white" />}
                title="希望しないシフト"
                description="任意"
                bgColor="bg-red-500"
              />

              <div className="space-y-2">
                {SHIFT_TYPES.map((shift) => (
                  <ShiftTypeCard
                    key={shift}
                    shift={shift}
                    isSelected={formState.notPreferred.includes(shift)}
                    onToggle={() => formState.toggleNotPreferred(shift)}
                    showCheckbox
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* コメント */}
          <Card className="p-5 border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/30">
            <SectionHeader
              icon={<MessageSquare className="h-5 w-5 text-white" />}
              title="コメント・要望"
              bgColor="bg-purple-500"
            />
            <textarea
              value={formState.comment}
              onChange={(e) => formState.setComment(e.target.value)}
              placeholder="その他の要望や備考があればご記入ください"
              className="w-full min-h-[100px] p-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition resize-none text-sm"
            />
          </Card>
        </div>

        {/* 右カラム: 勤務不可日選択 */}
        <div className="space-y-4">
          <Card className="p-5 border-0 shadow-xl bg-gradient-to-br from-white to-orange-50/30 sticky top-20">
            <SectionHeader
              icon={<CalendarIcon className="h-5 w-5 text-white" />}
              title="勤務不可日"
              bgColor="bg-orange-500"
            />

            <Calendar
              mode="single"
              selected={formState.currentDate}
              onSelect={formState.setCurrentDate}
              locale={ja}
              className="rounded-xl border-2 border-gray-200"
            />

            {formState.currentDate && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  {formatDateJa(formState.currentDate, 'yyyy年M月d日 (E)')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {UNAVAILABLE_REASONS.map((reason) => (
                    <Button
                      key={reason}
                      variant="outline"
                      size="sm"
                      onClick={() => formState.addUnavailableDate(reason)}
                      className="border-2 hover:bg-orange-500 hover:text-white hover:border-orange-500"
                    >
                      {reason}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* 勤務不可日一覧 */}
          <UnavailableDateList dates={formState.selectedDates} onRemove={formState.removeDate} />
        </div>
      </div>

      {/* 提出ボタン - 固定配置 */}
      <div className="sticky bottom-4 mt-6 flex justify-end z-10">
        <Button
          size="lg"
          onClick={submit}
          disabled={isSubmitting || !formState.selectedStaff || isLoadingStaff}
          className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all"
        >
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? '提出中...' : 'シフト希望を提出'}
        </Button>
      </div>
    </main>
  )
}