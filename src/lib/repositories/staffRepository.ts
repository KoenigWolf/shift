import { prisma } from '@/lib/prisma'
import { Staff, Prisma } from '@prisma/client'

/**
 * スタッフリポジトリ
 * スタッフに関するデータベース操作を集約
 */
export class StaffRepository {
  /**
   * 全スタッフを取得
   */
  async findAll(): Promise<Staff[]> {
    return await prisma.staff.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * IDでスタッフを取得
   */
  async findById(id: string): Promise<Staff | null> {
    return await prisma.staff.findUnique({
      where: { id },
    })
  }

  /**
   * スタッフを作成
   */
  async create(data: Prisma.StaffCreateInput): Promise<Staff> {
    return await prisma.staff.create({
      data,
    })
  }

  /**
   * スタッフを更新
   */
  async update(id: string, data: Prisma.StaffUpdateInput): Promise<Staff> {
    return await prisma.staff.update({
      where: { id },
      data,
    })
  }

  /**
   * スタッフを削除
   */
  async delete(id: string): Promise<Staff> {
    return await prisma.staff.delete({
      where: { id },
    })
  }

  /**
   * 夜勤可能なスタッフを取得
   */
  async findNightShiftCapable(): Promise<Staff[]> {
    return await prisma.staff.findMany({
      where: { canWorkNight: true },
      orderBy: { name: 'asc' },
    })
  }

  /**
   * 役職でフィルタリング
   */
  async findByRole(role: string): Promise<Staff[]> {
    return await prisma.staff.findMany({
      where: { role },
      orderBy: { name: 'asc' },
    })
  }
}

// シングルトンインスタンス
export const staffRepository = new StaffRepository()
