import { z } from 'zod'

export const staffSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('正しいメールアドレスを入力してください'),
  role: z.string().min(1, '役職は必須です'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '正しい色コードを入力してください'),
})

export type StaffFormData = z.infer<typeof staffSchema>
