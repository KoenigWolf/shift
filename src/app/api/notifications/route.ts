import { NextRequest } from 'next/server'
import { notificationRepository } from '@/lib/repositories'
import { withErrorHandling, successResponse, getQueryParams } from '@/lib/api/apiHandler'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const notificationSchema = z.object({
  staffId: z.string().cuid(),
  type: z.enum(['シフト確定', '希望提出依頼', 'シフト変更', '承認依頼']),
  title: z.string().min(1),
  message: z.string().min(1),
  link: z.string().optional(),
})

const bulkNotificationSchema = z.object({
  staffIds: z.array(z.string().cuid()),
  type: z.enum(['シフト確定', '希望提出依頼', 'シフト変更', '承認依頼']),
  title: z.string().min(1),
  message: z.string().min(1),
  link: z.string().optional(),
})

export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = getQueryParams(request)
  const staffId = searchParams.get('staffId')
  const isRead = searchParams.get('isRead')

  const where: Prisma.NotificationWhereInput = {}
  if (staffId) where.staffId = staffId
  if (isRead !== null) where.isRead = isRead === 'true'

  const notifications = await notificationRepository.findAll(where, 50)
  return successResponse(notifications)
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json()

  // 一括通知
  if (Array.isArray(body.staffIds)) {
    const validated = bulkNotificationSchema.parse(body)
    const notifications = await notificationRepository.createMany(
      validated.staffIds,
      {
        type: validated.type,
        title: validated.title,
        message: validated.message,
        link: validated.link,
      }
    )
    return successResponse(notifications, 201)
  }

  // 単一通知
  const validated = notificationSchema.parse(body)
  const notification = await notificationRepository.create({
    staffId: validated.staffId,
    type: validated.type,
    title: validated.title,
    message: validated.message,
    link: validated.link,
  })

  return successResponse(notification, 201)
})
