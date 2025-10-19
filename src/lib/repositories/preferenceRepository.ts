import { prisma } from '@/lib/prisma'
import { ShiftPreference, Prisma } from '@prisma/client'

/**
 * シフト希望リポジトリ
 * シフト希望に関するデータベース操作を集約
 */
export class PreferenceRepository {
  /**
   * 全希望を取得（スタッフ情報を含む）
   */
  async findAll() {
    return await prisma.shiftPreference.findMany({
      include: { staff: true },
      orderBy: { submittedAt: 'desc' },
    })
  }

  /**
   * IDで希望を取得
   */
  async findById(id: string) {
    return await prisma.shiftPreference.findUnique({
      where: { id },
      include: { staff: true },
    })
  }

  /**
   * スタッフIDで希望を取得
   */
  async findByStaffId(staffId: string) {
    return await prisma.shiftPreference.findMany({
      where: { staffId },
      include: { staff: true },
      orderBy: { targetMonth: 'desc' },
    })
  }

  /**
   * 対象月で希望を取得
   */
  async findByTargetMonth(targetMonth: Date) {
    return await prisma.shiftPreference.findMany({
      where: { targetMonth },
      include: { staff: true },
      orderBy: { submittedAt: 'desc' },
    })
  }

  /**
   * スタッフIDと対象月で希望を取得
   */
  async findByStaffIdAndMonth(staffId: string, targetMonth: Date) {
    return await prisma.shiftPreference.findFirst({
      where: {
        staffId,
        targetMonth,
      },
      include: { staff: true },
    })
  }

  /**
   * 希望を作成または更新（upsert）
   */
  async upsert(
    staffId: string,
    targetMonth: Date,
    data: Prisma.ShiftPreferenceCreateInput
  ) {
    return await prisma.shiftPreference.upsert({
      where: {
        staffId_targetMonth: {
          staffId,
          targetMonth,
        },
      },
      update: data,
      create: data,
      include: { staff: true },
    })
  }

  /**
   * 希望を作成
   */
  async create(data: Prisma.ShiftPreferenceCreateInput) {
    return await prisma.shiftPreference.create({
      data,
      include: { staff: true },
    })
  }

  /**
   * 希望を更新
   */
  async update(id: string, data: Prisma.ShiftPreferenceUpdateInput) {
    return await prisma.shiftPreference.update({
      where: { id },
      data,
      include: { staff: true },
    })
  }

  /**
   * 希望を削除
   */
  async delete(id: string) {
    return await prisma.shiftPreference.delete({
      where: { id },
    })
  }
}

// シングルトンインスタンス
export const preferenceRepository = new PreferenceRepository()
