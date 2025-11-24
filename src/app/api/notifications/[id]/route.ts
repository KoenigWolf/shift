import { NextRequest } from 'next/server'
import { notificationRepository } from '@/lib/repositories'
import { withErrorHandling, successResponse, getParams } from '@/lib/api/apiHandler'

type NotificationParams = { id: string }

export const PATCH = withErrorHandling<NotificationParams>(async (
  request: NextRequest,
  context?: { params?: Promise<NotificationParams> }
) => {
  const { id } = await getParams<NotificationParams>(context)
  const notification = await notificationRepository.markAsRead(id)
  return successResponse(notification)
})

export const DELETE = withErrorHandling<NotificationParams>(async (
  request: NextRequest,
  context?: { params?: Promise<NotificationParams> }
) => {
  const { id } = await getParams<NotificationParams>(context)
  await notificationRepository.delete(id)
  return successResponse({ message: '通知を削除しました' })
})
