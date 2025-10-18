'use client'

import { ShiftForm } from '@/components/shifts/ShiftForm'
import { Header } from '@/components/layout/Header'

export default function ShiftsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">シフト作成</h1>
            <p className="text-gray-600">新しいシフトを作成します</p>
          </div>
          
          <ShiftForm
            onSuccess={() => {
              // 成功時の処理（必要に応じて実装）
            }}
            onCancel={() => {
              // キャンセル時の処理（必要に応じて実装）
            }}
          />
        </div>
      </main>
    </div>
  )
}
