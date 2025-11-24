import { prisma } from '@/lib/prisma'
import { LeaveRequest, Prisma } from '@prisma/client'

/**
 * 休暇申請リポジトリ
 * 休暇申請に関するデータベース操作を集約
 */
export class LeaveRequestRepository {
  /**
   * 全休暇申請を取得
   */
  async findAll(where?: Prisma.LeaveRequestWhereInput) {
    return await prisma.leaveRequest.findMany({
      where,
      include: {
        staff: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    })
  }

  /**
   * IDで休暇申請を取得
   */
  async findById(id: string) {
    return await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        staff: true,
      },
    })
  }

  /**
   * 休暇申請を作成
   */
  async create(data: Omit<Prisma.LeaveRequestCreateInput, 'staff'> & { staffId: string }) {
    const { staffId, ...rest } = data
    return await prisma.leaveRequest.create({
      data: {
        ...rest,
        staff: {
          connect: { id: staffId }
        }
      },
      include: {
        staff: true,
      },
    })
  }

  /**
   * 休暇申請を更新
   */
  async update(id: string, data: Prisma.LeaveRequestUpdateInput) {
    return await prisma.leaveRequest.update({
      where: { id },
      data,
      include: {
        staff: true,
      },
    })
  }

  /**
   * 休暇申請を削除
   */
  async delete(id: string) {
    return await prisma.leaveRequest.delete({
      where: { id },
    })
  }
}

// シングルトンインスタンス
export const leaveRequestRepository = new LeaveRequestRepository()

