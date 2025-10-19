import { prisma } from '@/lib/prisma'
import { Shift, Prisma } from '@prisma/client'

/**
 * シフトリポジトリ
 * シフトに関するデータベース操作を集約
 */
export class ShiftRepository {
  /**
   * 全シフトを取得（スタッフ情報を含む）
   */
  async findAll() {
    return await prisma.shift.findMany({
      include: { staff: true },
      orderBy: { date: 'asc' },
    })
  }

  /**
   * IDでシフトを取得
   */
  async findById(id: string) {
    return await prisma.shift.findUnique({
      where: { id },
      include: { staff: true },
    })
  }

  /**
   * スタッフIDでシフトを取得
   */
  async findByStaffId(staffId: string) {
    return await prisma.shift.findMany({
      where: { staffId },
      include: { staff: true },
      orderBy: { date: 'asc' },
    })
  }

  /**
   * 日付範囲でシフトを取得
   */
  async findByDateRange(startDate: Date, endDate: Date) {
    return await prisma.shift.findMany({
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
   * シフトを作成
   */
  async create(data: Prisma.ShiftCreateInput) {
    return await prisma.shift.create({
      data,
      include: { staff: true },
    })
  }

  /**
   * シフトを更新
   */
  async update(id: string, data: Prisma.ShiftUpdateInput) {
    return await prisma.shift.update({
      where: { id },
      data,
      include: { staff: true },
    })
  }

  /**
   * シフトを削除
   */
  async delete(id: string) {
    return await prisma.shift.delete({
      where: { id },
    })
  }

  /**
   * 複数シフトを一括作成
   */
  async createMany(data: Prisma.ShiftCreateManyInput[]) {
    return await prisma.shift.createMany({
      data,
      skipDuplicates: true,
    })
  }

  /**
   * 特定の日付・スタッフ・シフトタイプで検索
   */
  async findByDateStaffAndType(date: Date, staffId: string, shiftType: string) {
    return await prisma.shift.findFirst({
      where: {
        date,
        staffId,
        shiftType,
      },
      include: { staff: true },
    })
  }
}

// シングルトンインスタンス
export const shiftRepository = new ShiftRepository()
