'use client'

import { ShiftForm } from '@/components/shifts/ShiftForm'
import { Header } from '@/components/layout/Header'

export default function ShiftsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <ShiftForm
          onSuccess={() => {
            // 成功時の処理（必要に応じて実装）
          }}
          onCancel={() => {
            // キャンセル時の処理（必要に応じて実装）
          }}
        />
      </main>
    </div>
  )
}
