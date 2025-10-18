import { z } from 'zod'

export const templateSchema = z.object({
  name: z.string().min(1, 'テンプレート名は必須です'),
  shiftType: z.string().default('日勤'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '正しい時刻形式で入力してください'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '正しい時刻形式で入力してください'),
  breakTime: z.number().min(0).max(480),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '正しい色コードを入力してください').default('#3b82f6'),
}).refine((data) => data.startTime < data.endTime, {
  message: '終了時刻は開始時刻より後にしてください',
  path: ['endTime'],
})

export type TemplateFormData = z.infer<typeof templateSchema>
