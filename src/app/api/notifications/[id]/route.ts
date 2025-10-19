import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH: 通知を既読にする
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
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

    return NextResponse.json({ success: true, data: notification })
  } catch (error) {
    console.error('PATCH /api/notifications/[id] error:', error)
    return NextResponse.json(
      { success: false, error: '通知の更新に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * DELETE: 通知を削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.notification.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/notifications/[id] error:', error)
    return NextResponse.json(
      { success: false, error: '通知の削除に失敗しました' },
      { status: 500 }
    )
  }
}
