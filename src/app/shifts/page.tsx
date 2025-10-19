'use client'

import { ShiftForm } from '@/components/shifts/ShiftForm'

export default function ShiftsPage() {
  return (
    <main className="container mx-auto px-4 py-4 max-w-[1200px]">
      <ShiftForm
        onSuccess={() => {
          // 成功時の処理（必要に応じて実装）
        }}
        onCancel={() => {
          // キャンセル時の処理（必要に応じて実装）
        }}
      />
    </main>
  )
}
