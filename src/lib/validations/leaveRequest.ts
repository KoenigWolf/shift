import { z } from 'zod'

export const leaveRequestSchema = z.object({
  staffId: z.string().min(1, 'スタッフを選択してください'),
  startDate: z.date(),
  endDate: z.date(),
  type: z.string().min(1, '休暇種別を選択してください'),
  reason: z.string().optional(),
  status: z.string().default('申請中'),
}).refine((data) => data.startDate <= data.endDate, {
  message: '終了日は開始日以降にしてください',
  path: ['endDate'],
})

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>

// 休暇種別の選択肢
export const LEAVE_TYPES = [
  { value: '有給', label: '有給休暇', color: 'green' },
  { value: '希望休', label: '希望休', color: 'blue' },
  { value: '特別休暇', label: '特別休暇', color: 'purple' },
  { value: '公休', label: '公休', color: 'gray' },
  { value: '病欠', label: '病欠', color: 'red' },
] as const

// 申請ステータスの選択肢
export const LEAVE_STATUSES = [
  { value: '申請中', label: '申請中', color: 'yellow' },
  { value: '承認', label: '承認', color: 'green' },
  { value: '却下', label: '却下', color: 'red' },
] as const
