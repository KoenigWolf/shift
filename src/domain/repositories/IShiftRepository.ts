/**
 * Shift Repository Interface - Domain Layer
 */

import { Shift, ShiftId, ShiftType, ShiftStatus } from '../entities/Shift'
import { StaffId } from '../entities/Staff'

export interface DateRange {
  readonly start: Date
  readonly end: Date
}

export interface ShiftSearchCriteria {
  readonly staffId?: StaffId
  readonly dateRange?: DateRange
  readonly shiftType?: ShiftType
  readonly status?: ShiftStatus
}

export interface IShiftRepository {
  /**
   * IDでシフトを取得
   */
  findById(id: ShiftId): Promise<Shift | null>

  /**
   * 検索条件に基づいてシフトを取得
   */
  findByCriteria(criteria: ShiftSearchCriteria): Promise<Shift[]>

  /**
   * スタッフIDと日付範囲でシフトを取得
   */
  findByStaffAndDateRange(staffId: StaffId, dateRange: DateRange): Promise<Shift[]>

  /**
   * 特定日のシフトを取得
   */
  findByDate(date: Date): Promise<Shift[]>

  /**
   * シフトを作成
   */
  create(shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shift>

  /**
   * シフトを更新
   */
  update(id: ShiftId, shift: Partial<Shift>): Promise<Shift>

  /**
   * シフトを削除
   */
  delete(id: ShiftId): Promise<void>

  /**
   * シフトを一括作成
   */
  createBulk(shifts: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Shift[]>

  /**
   * 月間のシフト統計を取得
   */
  getMonthlyStats(year: number, month: number): Promise<{
    totalShifts: number
    dayShifts: number
    nightShifts: number
    eveningShifts: number
  }>
}
