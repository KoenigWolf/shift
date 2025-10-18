'use client'

import { ShiftForm } from '@/components/shifts/ShiftForm'
import { Header } from '@/components/layout/Header'

export default function ShiftsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            シフト作成
          </h1>
        </div>

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
