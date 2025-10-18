import { z } from 'zod'

export const shiftSchema = z.object({
  staffId: z.string().min(1, 'スタッフを選択してください'),
  date: z.date(),
  shiftType: z.string().default('日勤'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '正しい時刻形式で入力してください'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '正しい時刻形式で入力してください'),
  breakTime: z.number().min(0).max(480),
  memo: z.string().optional(),
  status: z.string().default('確定'),
  isPublished: z.boolean().default(false),
})

export type ShiftFormData = z.infer<typeof shiftSchema>

// シフトタイプの定義
export const SHIFT_TYPES = [
  {
    value: '日勤',
    label: '日勤',
    defaultStart: '08:30',
    defaultEnd: '17:00',
    color: '#3b82f6',
    icon: '☀️'
  },
  {
    value: '夜勤',
    label: '夜勤',
    defaultStart: '16:30',
    defaultEnd: '09:00',
    color: '#8b5cf6',
    icon: '🌙'
  },
  {
    value: '準夜勤',
    label: '準夜勤',
    defaultStart: '16:30',
    defaultEnd: '01:00',
    color: '#f59e0b',
    icon: '🌆'
  },
  {
    value: '深夜勤',
    label: '深夜勤',
    defaultStart: '00:30',
    defaultEnd: '09:00',
    color: '#6366f1',
    icon: '🌃'
  },
] as const

// シフトステータスの選択肢
export const SHIFT_STATUSES = [
  { value: '下書き', label: '下書き', color: 'gray' },
  { value: '確定', label: '確定', color: 'blue' },
  { value: '承認待ち', label: '承認待ち', color: 'yellow' },
] as const
