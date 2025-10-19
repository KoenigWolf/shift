/**
 * Staff Entity - Domain Layer
 * ビジネスロジックの中心となるスタッフエンティティ
 */

export interface StaffId {
  readonly value: string
}

export interface Email {
  readonly value: string
}

export interface StaffConstraints {
  readonly maxConsecutiveDays: number | null
  readonly maxMonthlyHours: number | null
  readonly maxNightShifts: number | null
  readonly canWorkNight: boolean
}

export interface Staff {
  readonly id: StaffId
  readonly name: string
  readonly email: Email
  readonly role: string
  readonly qualification: string | null
  readonly employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT'
  readonly color: string
  readonly constraints: StaffConstraints
  readonly createdAt: Date
  readonly updatedAt: Date
}

/**
 * Value Objectの作成関数
 */
export const createStaffId = (value: string): StaffId => {
  if (!value || value.trim().length === 0) {
    throw new Error('Staff ID cannot be empty')
  }
  return { value }
}

export const createEmail = (value: string): Email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    throw new Error('Invalid email format')
  }
  return { value }
}

/**
 * ドメインロジック: スタッフが夜勤可能かチェック
 */
export const canStaffWorkNightShift = (staff: Staff): boolean => {
  return staff.constraints.canWorkNight
}

/**
 * ドメインロジック: 月間夜勤制約をチェック
 */
export const hasExceededMonthlyNightShiftLimit = (
  staff: Staff,
  currentNightShiftCount: number
): boolean => {
  if (staff.constraints.maxNightShifts === null) {
    return false
  }
  return currentNightShiftCount >= staff.constraints.maxNightShifts
}

/**
 * ドメインロジック: 月間勤務時間制約をチェック
 */
export const hasExceededMonthlyHoursLimit = (
  staff: Staff,
  currentMonthlyHours: number
): boolean => {
  if (staff.constraints.maxMonthlyHours === null) {
    return false
  }
  return currentMonthlyHours >= staff.constraints.maxMonthlyHours
}

/**
 * ドメインロジック: 連続勤務日数制約をチェック
 */
export const hasExceededConsecutiveDaysLimit = (
  staff: Staff,
  consecutiveDays: number
): boolean => {
  if (staff.constraints.maxConsecutiveDays === null) {
    return false
  }
  return consecutiveDays >= staff.constraints.maxConsecutiveDays
}
