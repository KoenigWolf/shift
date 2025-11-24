import { prisma } from '@/lib/prisma'
import { Notification, Prisma } from '@prisma/client'

/**
 * 通知リポジトリ
 * 通知に関するデータベース操作を集約
 */
export class NotificationRepository {
  /**
   * 通知一覧を取得
   */
  async findAll(where?: Prisma.NotificationWhereInput, take?: number) {
    return await prisma.notification.findMany({
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
      take: take || 50,
    })
  }

  /**
   * IDで通知を取得
   */
  async findById(id: string) {
    return await prisma.notification.findUnique({
      where: { id },
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
  }

  /**
   * 通知を作成
   */
  async create(data: Omit<Prisma.NotificationCreateInput, 'staff'> & { staffId: string }) {
    const { staffId, ...rest } = data
    return await prisma.notification.create({
      data: {
        ...rest,
        staff: {
          connect: { id: staffId }
        },
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
  }

  /**
   * 複数通知を一括作成
   */
  async createMany(
    staffIds: string[],
    data: Omit<Prisma.NotificationCreateInput, 'staff' | 'isRead'>
  ) {
    return await Promise.all(
      staffIds.map((staffId) =>
        this.create({
          staffId,
          ...data,
        })
      )
    )
  }

  /**
   * 通知を既読にする
   */
  async markAsRead(id: string) {
    return await prisma.notification.update({
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
  }

  /**
   * 通知を削除
   */
  async delete(id: string) {
    return await prisma.notification.delete({
      where: { id },
    })
  }
}

// シングルトンインスタンス
export const notificationRepository = new NotificationRepository()

