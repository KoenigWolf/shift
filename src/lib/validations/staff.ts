import { z } from 'zod'

export const staffSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('正しいメールアドレスを入力してください'),
  role: z.string().min(1, '役職は必須です'),
  qualification: z.string().optional(),
  employmentType: z.string().default('常勤'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '正しい色コードを入力してください'),
  maxConsecutiveDays: z.number().min(1).max(31).optional(),
  maxMonthlyHours: z.number().min(1).max(744).optional(),
  maxNightShifts: z.number().min(0).max(31).optional(),
  canWorkNight: z.boolean().default(true),
})

export type StaffFormData = z.infer<typeof staffSchema>

// 役職の選択肢
export const STAFF_ROLES = [
  { value: '正看護師', label: '正看護師' },
  { value: '准看護師', label: '准看護師' },
  { value: '看護助手', label: '看護助手' },
  { value: '主任', label: '主任' },
  { value: '師長', label: '師長' },
] as const

// 資格の選択肢
export const QUALIFICATIONS = [
  { value: '', label: 'なし' },
  { value: '認定看護師', label: '認定看護師' },
  { value: '専門看護師', label: '専門看護師' },
  { value: '特定行為研修修了', label: '特定行為研修修了' },
] as const

// 雇用形態の選択肢
export const EMPLOYMENT_TYPES = [
  { value: '常勤', label: '常勤' },
  { value: '非常勤', label: '非常勤' },
  { value: 'パート', label: 'パート' },
] as const
