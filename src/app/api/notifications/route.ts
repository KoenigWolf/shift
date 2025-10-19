import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

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

/**
 * GET: 通知一覧取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staffId')
    const isRead = searchParams.get('isRead')

    const where: any = {}
    if (staffId) where.staffId = staffId
    if (isRead !== null) where.isRead = isRead === 'true'

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ success: true, data: notifications })
  } catch (error) {
    console.error('GET /api/notifications error:', error)
    return NextResponse.json(
      { success: false, error: '通知の取得に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * POST: 通知を作成（単一または一括）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 一括通知
    if (Array.isArray(body.staffIds)) {
      const validated = bulkNotificationSchema.parse(body)

      const notifications = await Promise.all(
        validated.staffIds.map((staffId) =>
          prisma.notification.create({
            data: {
              staffId,
              type: validated.type,
              title: validated.title,
              message: validated.message,
              link: validated.link,
              isRead: false,
            },
            include: {
              staff: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
          })
        )
      )

      return NextResponse.json(
        { success: true, data: notifications },
        { status: 201 }
      )
    }

    // 単一通知
    const validated = notificationSchema.parse(body)

    const notification = await prisma.notification.create({
      data: {
        staffId: validated.staffId,
        type: validated.type,
        title: validated.title,
        message: validated.message,
        link: validated.link,
        isRead: false,
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: notification }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'バリデーションエラー', details: error.issues },
        { status: 400 }
      )
    }
    console.error('POST /api/notifications error:', error)
    return NextResponse.json(
      { success: false, error: '通知の作成に失敗しました' },
      { status: 500 }
    )
  }
}
