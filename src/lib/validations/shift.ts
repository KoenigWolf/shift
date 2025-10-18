import { z } from 'zod'

export const shiftSchema = z.object({
  staffId: z.string().min(1, 'スタッフを選択してください'),
  date: z.date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '正しい時刻形式で入力してください'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '正しい時刻形式で入力してください'),
  breakTime: z.number().min(0).max(480),
  memo: z.string().optional(),
}).refine((data) => data.startTime < data.endTime, {
  message: '終了時刻は開始時刻より後にしてください',
  path: ['endTime'],
})

export type ShiftFormData = z.infer<typeof shiftSchema>
