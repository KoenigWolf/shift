'use client'

import { useState, useEffect } from 'react'
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
          const result = await response.json()
          setShifts(result.success ? result.data : [])
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
      <main className="container mx-auto px-4 py-4 max-w-[1600px]">
        <LoadingSpinner />
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-4 max-w-[1600px]">
      <ShiftCalendar shifts={shifts} />
    </main>
  )
}
