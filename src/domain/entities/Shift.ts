/**
 * Shift Entity - Domain Layer
 * シフトのビジネスロジックを含むエンティティ
 */

import { StaffId } from './Staff'

export interface ShiftId {
  readonly value: string
}

export type ShiftType = 'DAY_SHIFT' | 'EVENING_SHIFT' | 'NIGHT_SHIFT' | 'DEEP_NIGHT_SHIFT'

export type ShiftStatus = 'DRAFT' | 'CONFIRMED' | 'PENDING_APPROVAL'

export interface TimeRange {
  readonly startTime: string // HH:mm format
  readonly endTime: string   // HH:mm format
}

export interface Shift {
  readonly id: ShiftId
  readonly staffId: StaffId
  readonly date: Date
  readonly shiftType: ShiftType
  readonly timeRange: TimeRange
  readonly breakTime: number // minutes
  readonly memo: string | null
  readonly status: ShiftStatus
  readonly isPublished: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
}

/**
 * Value Object作成関数
 */
export const createShiftId = (value: string): ShiftId => {
  if (!value || value.trim().length === 0) {
    throw new Error('Shift ID cannot be empty')
  }
  return { value }
}

export const createTimeRange = (startTime: string, endTime: string): TimeRange => {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

  if (!timeRegex.test(startTime)) {
    throw new Error('Invalid start time format. Expected HH:mm')
  }

  if (!timeRegex.test(endTime)) {
    throw new Error('Invalid end time format. Expected HH:mm')
  }

  return { startTime, endTime }
}

/**
 * ドメインロジック: シフトの実働時間を計算（分単位）
 */
export const calculateWorkingMinutes = (shift: Shift): number => {
  const [startHour, startMinute] = shift.timeRange.startTime.split(':').map(Number)
  const [endHour, endMinute] = shift.timeRange.endTime.split(':').map(Number)

  let totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute)

  // 日跨ぎの場合
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60
  }

  return Math.max(0, totalMinutes - shift.breakTime)
}

/**
 * ドメインロジック: シフトが夜勤かどうか判定
 */
export const isNightShift = (shift: Shift): boolean => {
  return shift.shiftType === 'NIGHT_SHIFT' || shift.shiftType === 'DEEP_NIGHT_SHIFT'
}

/**
 * ドメインロジック: シフトが公開可能か判定
 */
export const canPublishShift = (shift: Shift): boolean => {
  return shift.status === 'CONFIRMED' && !shift.isPublished
}

/**
 * ドメインロジック: シフトの時間が妥当かチェック
 */
export const isValidShiftDuration = (shift: Shift): boolean => {
  const workingMinutes = calculateWorkingMinutes(shift)
  // 最低30分、最大16時間
  return workingMinutes >= 30 && workingMinutes <= 960
}

/**
 * シフトタイプの日本語マッピング
 */
export const SHIFT_TYPE_LABELS: Record<ShiftType, string> = {
  DAY_SHIFT: '日勤',
  EVENING_SHIFT: '準夜勤',
  NIGHT_SHIFT: '夜勤',
  DEEP_NIGHT_SHIFT: '深夜勤',
} as const

/**
 * シフトステータスの日本語マッピング
 */
export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
  DRAFT: '下書き',
  CONFIRMED: '確定',
  PENDING_APPROVAL: '承認待ち',
} as const
