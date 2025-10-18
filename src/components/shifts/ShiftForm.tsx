'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { shiftFormSchema, ShiftFormData, SHIFT_TYPES, SHIFT_STATUSES } from '@/lib/validations/shift'
import { Staff, Shift } from '@prisma/client'
import { CalendarIcon, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

interface ShiftFormProps {
  shift?: Shift
  onSuccess: () => void
  onCancel: () => void
}

export function ShiftForm({ shift, onSuccess, onCancel }: ShiftFormProps) {
  const [staff, setStaff] = useState<Staff[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingStaff, setIsLoadingStaff] = useState(true)
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShiftFormData>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: shift ? {
      staffId: shift.staffId,
      date: new Date(shift.date),
      shiftType: shift.shiftType,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakTime: shift.breakTime,
      memo: shift.memo || '',
      status: shift.status,
      isPublished: shift.isPublished,
    } : {
      staffId: '',
      date: new Date(),
      shiftType: '日勤',
      startTime: '08:30',
      endTime: '17:00',
      breakTime: 60,
      memo: '',
      status: '確定',
      isPublished: false,
    },
  })

  const selectedDate = watch('date')
  const selectedStaffId = watch('staffId')
  const selectedShiftType = watch('shiftType')

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch('/api/staff')
        if (response.ok) {
          const data = await response.json()
          setStaff(data)
        }
      } catch (error) {
        console.error('Error fetching staff:', error)
        toast.error('スタッフの取得に失敗しました')
      } finally {
        setIsLoadingStaff(false)
      }
    }

    fetchStaff()
  }, [])

  // シフトタイプが変更されたらデフォルト時間を設定
  useEffect(() => {
    if (!shift) { // 新規作成時のみ
      const shiftTypeConfig = SHIFT_TYPES.find(st => st.value === selectedShiftType)
      if (shiftTypeConfig) {
        setValue('startTime', shiftTypeConfig.defaultStart)
        setValue('endTime', shiftTypeConfig.defaultEnd)
      }
    }
  }, [selectedShiftType, shift, setValue])

  const onSubmit = async (data: ShiftFormData) => {
    setIsSubmitting(true)
    try {
      const url = shift ? `/api/shifts/${shift.id}` : '/api/shifts'
      const method = shift ? 'PUT' : 'POST'

      console.log('Submitting shift data:', data)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }

        console.error('API Error:', errorData)
        const errorMessage = errorData.error || errorData.details || '保存に失敗しました'
        throw new Error(errorMessage)
      }

      toast.success(shift ? 'シフトを更新しました' : 'シフトを作成しました')
      onSuccess()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました'
      toast.error(errorMessage)
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingStaff) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{shift ? 'シフト編集' : '新規シフト作成'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staffId">スタッフ</Label>
            <Select
              value={selectedStaffId}
              onValueChange={(value) => setValue('staffId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="スタッフを選択" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: member.color }}
                      />
                      <span>{member.name}</span>
                      <span className="text-xs text-gray-500">({member.role})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.staffId && (
              <p className="text-sm text-red-600">{errors.staffId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shiftType">勤務区分</Label>
            <div className="grid grid-cols-2 gap-2">
              {SHIFT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setValue('shiftType', type.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedShiftType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{type.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">
                        {type.defaultStart}〜{type.defaultEnd}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {errors.shiftType && (
              <p className="text-sm text-red-600">{errors.shiftType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>日付</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'yyyy年MM月dd日', { locale: ja }) : '日付を選択'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setValue('date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">開始時刻</Label>
              <Input
                id="startTime"
                type="time"
                {...register('startTime')}
              />
              {errors.startTime && (
                <p className="text-sm text-red-600">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">終了時刻</Label>
              <Input
                id="endTime"
                type="time"
                {...register('endTime')}
              />
              {errors.endTime && (
                <p className="text-sm text-red-600">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="breakTime">休憩時間（分）</Label>
            <Input
              id="breakTime"
              type="number"
              min="0"
              max="480"
              {...register('breakTime', { valueAsNumber: true })}
            />
            {errors.breakTime && (
              <p className="text-sm text-red-600">{errors.breakTime.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">メモ</Label>
            <Input
              id="memo"
              {...register('memo')}
              placeholder="メモを入力（任意）"
            />
            {errors.memo && (
              <p className="text-sm text-red-600">{errors.memo.message}</p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : shift ? '更新' : '作成'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
