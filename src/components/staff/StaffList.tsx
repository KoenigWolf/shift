'use client'

import { useState, useEffect } from 'react'
import { Staff } from '@prisma/client'
import { StaffCard } from './StaffCard'
import { StaffForm } from './StaffForm'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export function StaffList() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff')
      if (response.ok) {
        const data = await response.json()
        setStaff(data)
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleStaffUpdate = () => {
    fetchStaff()
  }

  const handleStaffDelete = (id: string) => {
    setStaff(staff.filter(s => s.id !== id))
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          スタッフ管理
        </h1>
        <Button onClick={() => setShowForm(true)} className="shadow-md hover:shadow-lg transition-shadow">
          <Plus className="h-4 w-4 mr-2" />
          新規登録
        </Button>
      </div>

      {showForm && (
        <StaffForm
          onSuccess={() => {
            setShowForm(false)
            handleStaffUpdate()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {staff.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          スタッフが登録されていません
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <StaffCard
              key={member.id}
              staff={member}
              onUpdate={handleStaffUpdate}
              onDelete={handleStaffDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
