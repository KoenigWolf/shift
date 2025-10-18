'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { staffFormSchema, StaffFormData, STAFF_ROLES, QUALIFICATIONS, EMPLOYMENT_TYPES } from '@/lib/validations/staff'
import { Staff } from '@prisma/client'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'

interface StaffFormProps {
  staff?: Staff
  onSuccess: () => void
  onCancel: () => void
}

const colors = [
  { value: '#3b82f6', label: '青' },
  { value: '#ef4444', label: '赤' },
  { value: '#10b981', label: '緑' },
  { value: '#f59e0b', label: 'オレンジ' },
  { value: '#8b5cf6', label: '紫' },
  { value: '#ec4899', label: 'ピンク' },
  { value: '#6b7280', label: 'グレー' },
  { value: '#14b8a6', label: 'ティール' },
]

export function StaffForm({ staff, onSuccess, onCancel }: StaffFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: staff ? {
      name: staff.name,
      email: staff.email,
      role: staff.role,
      qualification: staff.qualification || 'なし',
      employmentType: staff.employmentType,
      color: staff.color,
      maxConsecutiveDays: staff.maxConsecutiveDays ?? null,
      maxMonthlyHours: staff.maxMonthlyHours ?? null,
      maxNightShifts: staff.maxNightShifts ?? null,
      canWorkNight: staff.canWorkNight,
    } : {
      name: '',
      email: '',
      role: '',
      qualification: 'なし',
      employmentType: '常勤',
      color: '#3b82f6',
      maxConsecutiveDays: null,
      maxMonthlyHours: null,
      maxNightShifts: null,
      canWorkNight: true,
    },
  })

  const selectedColor = watch('color')
  const canWorkNight = watch('canWorkNight')

  const onSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true)
    try {
      const url = staff ? `/api/staff/${staff.id}` : '/api/staff'
      const method = staff ? 'PUT' : 'POST'

      // 資格が'なし'の場合はnullに変換
      const submitData = {
        ...data,
        qualification: data.qualification === 'なし' ? null : data.qualification,
      }

      console.log('Submitting staff data:', submitData)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
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

      toast.success(staff ? 'スタッフを更新しました' : 'スタッフを登録しました')
      onSuccess()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました'
      toast.error(errorMessage)
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{staff ? 'スタッフ編集' : '新規スタッフ登録'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="山田太郎"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="yamada@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">役職</Label>
            <Select
              value={watch('role')}
              onValueChange={(value) => setValue('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="役職を選択" />
              </SelectTrigger>
              <SelectContent>
                {STAFF_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualification">資格（任意）</Label>
            <Select
              value={watch('qualification') || 'なし'}
              onValueChange={(value) => setValue('qualification', value === 'なし' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="資格を選択" />
              </SelectTrigger>
              <SelectContent>
                {QUALIFICATIONS.map((qual) => (
                  <SelectItem key={qual.value} value={qual.value}>
                    {qual.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employmentType">雇用形態</Label>
            <Select
              value={watch('employmentType')}
              onValueChange={(value) => setValue('employmentType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="雇用形態を選択" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>表示色</Label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color.value
                      ? 'border-gray-800'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setValue('color', color.value)}
                />
              ))}
            </div>
            {errors.color && (
              <p className="text-sm text-red-600">{errors.color.message}</p>
            )}
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold text-gray-700">勤務制約設定</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="canWorkNight">夜勤可能</Label>
                <p className="text-sm text-gray-500">夜勤シフトへの配置を許可</p>
              </div>
              <Switch
                checked={canWorkNight}
                onCheckedChange={(checked) => setValue('canWorkNight', checked)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxConsecutiveDays">最大連続勤務日数</Label>
                <Input
                  id="maxConsecutiveDays"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="例: 5"
                  {...register('maxConsecutiveDays', {
                    setValueAs: (v) => v === '' || v === null ? null : Number(v)
                  })}
                />
                {errors.maxConsecutiveDays && (
                  <p className="text-sm text-red-600">{errors.maxConsecutiveDays.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMonthlyHours">月間最大勤務時間</Label>
                <Input
                  id="maxMonthlyHours"
                  type="number"
                  min="1"
                  max="744"
                  placeholder="例: 160"
                  {...register('maxMonthlyHours', {
                    setValueAs: (v) => v === '' || v === null ? null : Number(v)
                  })}
                />
                {errors.maxMonthlyHours && (
                  <p className="text-sm text-red-600">{errors.maxMonthlyHours.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxNightShifts">月間最大夜勤回数</Label>
                <Input
                  id="maxNightShifts"
                  type="number"
                  min="0"
                  max="31"
                  placeholder="例: 8"
                  {...register('maxNightShifts', {
                    setValueAs: (v) => v === '' || v === null ? null : Number(v)
                  })}
                />
                {errors.maxNightShifts && (
                  <p className="text-sm text-red-600">{errors.maxNightShifts.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : staff ? '更新' : '登録'}
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
