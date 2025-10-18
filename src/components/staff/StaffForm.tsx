'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { staffSchema, StaffFormData } from '@/lib/validations/staff'
import { Staff } from '@prisma/client'
import { toast } from 'sonner'

interface StaffFormProps {
  staff?: Staff
  onSuccess: () => void
  onCancel: () => void
}

const roles = [
  { value: '正社員', label: '正社員' },
  { value: 'アルバイト', label: 'アルバイト' },
  { value: 'パート', label: 'パート' },
  { value: '契約社員', label: '契約社員' },
]

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
    resolver: zodResolver(staffSchema),
    defaultValues: staff ? {
      name: staff.name,
      email: staff.email,
      role: staff.role,
      color: staff.color,
    } : {
      name: '',
      email: '',
      role: '',
      color: '#3b82f6',
    },
  })

  const selectedColor = watch('color')

  const onSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true)
    try {
      const url = staff ? `/api/staff/${staff.id}` : '/api/staff'
      const method = staff ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('保存に失敗しました')
      }

      toast.success(staff ? 'スタッフを更新しました' : 'スタッフを登録しました')
      onSuccess()
    } catch (error) {
      toast.error('エラーが発生しました')
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
                {roles.map((role) => (
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
