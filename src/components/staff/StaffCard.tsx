'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Staff } from '@prisma/client'
import { Edit, Trash2, Mail } from 'lucide-react'
import { StaffForm } from './StaffForm'

interface StaffCardProps {
  staff: Staff
  onUpdate: () => void
  onDelete: (id: string) => void
}

export function StaffCard({ staff, onUpdate, onDelete }: StaffCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('このスタッフを削除しますか？')) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/staff/${staff.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('削除に失敗しました')
      }

      onDelete(staff.id)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <StaffForm
        staff={staff}
        onSuccess={() => {
          setIsEditing(false)
          onUpdate()
        }}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <Card className="card-elevated animate-slide-up group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-full shadow-md flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-110 duration-200"
              style={{ backgroundColor: staff.color }}
            >
              {staff.name.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{staff.name}</CardTitle>
              <Badge variant="secondary" className="mt-1">{staff.role}</Badge>
            </div>
          </div>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-gray-600">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{staff.email}</span>
        </div>
        {staff.qualification && (
          <div className="mt-2 text-xs text-gray-500">
            資格: {staff.qualification}
          </div>
        )}
        {staff.canWorkNight && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              夜勤可能
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
