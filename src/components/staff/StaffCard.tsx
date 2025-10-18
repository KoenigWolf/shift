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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: staff.color }}
            />
            <CardTitle className="text-lg">{staff.name}</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{staff.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{staff.role}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
