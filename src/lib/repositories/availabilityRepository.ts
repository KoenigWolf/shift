import { prisma } from '@/lib/prisma'
import { Availability, Prisma } from '@prisma/client'

/**
 * 勤務可否リポジトリ
 * 勤務可否に関するデータベース操作を集約
 */
export class AvailabilityRepository {
  /**
   * 全勤務可否を取得（スタッフ情報を含む）
   */
  async findAll() {
    return await prisma.availability.findMany({
      include: { staff: true },
      orderBy: { date: 'asc' },
    })
  }

  /**
   * IDで勤務可否を取得
   */
  async findById(id: string) {
    return await prisma.availability.findUnique({
      where: { id },
      include: { staff: true },
    })
  }

  /**
   * スタッフIDで勤務可否を取得
   */
  async findByStaffId(staffId: string) {
    return await prisma.availability.findMany({
      where: { staffId },
      include: { staff: true },
      orderBy: { date: 'asc' },
    })
  }

  /**
   * 日付範囲で勤務可否を取得
   */
  async findByDateRange(startDate: Date, endDate: Date) {
    return await prisma.availability.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { staff: true },
      orderBy: { date: 'asc' },
    })
  }

  /**
   * スタッフIDと日付で勤務可否を取得
   */
  async findByStaffIdAndDate(staffId: string, date: Date) {
    return await prisma.availability.findUnique({
      where: {
        staffId_date: {
          staffId,
          date,
        },
      },
      include: { staff: true },
    })
  }

  /**
   * 勤務可否を作成または更新（upsert）
   */
  async upsert(staffId: string, date: Date, data: Prisma.AvailabilityCreateInput) {
    return await prisma.availability.upsert({
      where: {
        staffId_date: {
          staffId,
          date,
        },
      },
      update: data,
      create: data,
      include: { staff: true },
    })
  }

  /**
   * 勤務可否を作成
   */
  async create(data: Prisma.AvailabilityCreateInput) {
    return await prisma.availability.create({
      data,
      include: { staff: true },
    })
  }

  /**
   * 勤務可否を更新
   */
  async update(id: string, data: Prisma.AvailabilityUpdateInput) {
    return await prisma.availability.update({
      where: { id },
      data,
      include: { staff: true },
    })
  }

  /**
   * 勤務可否を削除
   */
  async delete(id: string) {
    return await prisma.availability.delete({
      where: { id },
    })
  }

  /**
   * 複数の勤務可否を一括作成（upsert）
   */
  async upsertMany(availabilities: Array<{ staffId: string; date: Date; data: Prisma.AvailabilityCreateInput }>) {
    const promises = availabilities.map(({ staffId, date, data }) =>
      this.upsert(staffId, date, data)
    )
    return await Promise.all(promises)
  }
}

// シングルトンインスタンス
export const availabilityRepository = new AvailabilityRepository()
