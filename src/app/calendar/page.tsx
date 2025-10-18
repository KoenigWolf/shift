'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { ShiftCalendar } from '@/components/shifts/ShiftCalendar'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ShiftWithStaff } from '@/types'

export default function CalendarPage() {
  const [shifts, setShifts] = useState<ShiftWithStaff[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await fetch('/api/shifts')
        if (response.ok) {
          const data = await response.json()
          setShifts(data)
        }
      } catch (error) {
        console.error('Error fetching shifts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchShifts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">カレンダー</h1>
            <p className="text-gray-600">シフトのカレンダー表示</p>
          </div>
          
          <ShiftCalendar shifts={shifts} />
        </div>
      </main>
    </div>
  )
}
