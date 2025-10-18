import { Shift, Staff } from '@prisma/client'
import { startOfMonth, endOfMonth, differenceInDays, isSameDay, parseISO } from 'date-fns'

// 勤務時間を計算（分単位）
export function calculateWorkMinutes(startTime: string, endTime: string, breakTime: number): number {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)

  // 日をまたぐ場合（夜勤など）
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60
  }

  return totalMinutes - breakTime
}

// 勤務時間を時間単位に変換
export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10
}

// 月間の勤務時間を計算
export function calculateMonthlyWorkHours(shifts: Shift[], year: number, month: number): number {
  const monthStart = startOfMonth(new Date(year, month - 1))
  const monthEnd = endOfMonth(new Date(year, month - 1))

  const monthlyShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.date)
    return shiftDate >= monthStart && shiftDate <= monthEnd
  })

  const totalMinutes = monthlyShifts.reduce((sum, shift) => {
    return sum + calculateWorkMinutes(shift.startTime, shift.endTime, shift.breakTime)
  }, 0)

  return minutesToHours(totalMinutes)
}

// 月間の夜勤回数を計算
export function calculateMonthlyNightShifts(shifts: Shift[], year: number, month: number): number {
  const monthStart = startOfMonth(new Date(year, month - 1))
  const monthEnd = endOfMonth(new Date(year, month - 1))

  return shifts.filter(shift => {
    const shiftDate = new Date(shift.date)
    const isInMonth = shiftDate >= monthStart && shiftDate <= monthEnd
    const isNightShift = shift.shiftType === '夜勤' || shift.shiftType === '深夜勤'
    return isInMonth && isNightShift
  }).length
}

// 連続勤務日数を計算
export function calculateConsecutiveDays(shifts: Shift[], targetDate: Date): number {
  const sortedShifts = [...shifts].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let consecutiveDays = 1 // 当日を含む
  const targetTime = targetDate.getTime()

  // 過去方向にチェック
  for (let i = sortedShifts.length - 1; i >= 0; i--) {
    const shift = sortedShifts[i]
    const shiftDate = new Date(shift.date)
    const daysDiff = Math.abs(differenceInDays(targetDate, shiftDate))

    if (daysDiff === consecutiveDays) {
      consecutiveDays++
    } else if (daysDiff > consecutiveDays) {
      break
    }
  }

  return consecutiveDays
}

// 制約違反をチェック
export interface ConstraintViolation {
  type: 'consecutive_days' | 'monthly_hours' | 'night_shifts' | 'cannot_work_night'
  message: string
  severity: 'error' | 'warning'
}

export function checkConstraints(
  staff: Staff,
  shifts: Shift[],
  newShift: { date: Date; shiftType: string; startTime: string; endTime: string; breakTime: number }
): ConstraintViolation[] {
  const violations: ConstraintViolation[] = []
  const year = newShift.date.getFullYear()
  const month = newShift.date.getMonth() + 1

  // 夜勤可否チェック
  if (!staff.canWorkNight && (newShift.shiftType === '夜勤' || newShift.shiftType === '深夜勤')) {
    violations.push({
      type: 'cannot_work_night',
      message: `${staff.name}は夜勤不可に設定されています`,
      severity: 'error'
    })
  }

  // 連続勤務日数チェック
  if (staff.maxConsecutiveDays) {
    const consecutiveDays = calculateConsecutiveDays(shifts, newShift.date)
    if (consecutiveDays >= staff.maxConsecutiveDays) {
      violations.push({
        type: 'consecutive_days',
        message: `連続勤務日数が上限（${staff.maxConsecutiveDays}日）に達しています（現在: ${consecutiveDays}日）`,
        severity: 'warning'
      })
    }
  }

  // 月間勤務時間チェック
  if (staff.maxMonthlyHours) {
    const currentHours = calculateMonthlyWorkHours(shifts, year, month)
    const newShiftHours = minutesToHours(
      calculateWorkMinutes(newShift.startTime, newShift.endTime, newShift.breakTime)
    )
    const totalHours = currentHours + newShiftHours

    if (totalHours > staff.maxMonthlyHours) {
      violations.push({
        type: 'monthly_hours',
        message: `月間勤務時間が上限（${staff.maxMonthlyHours}時間）を超過します（現在: ${currentHours.toFixed(1)}時間、追加後: ${totalHours.toFixed(1)}時間）`,
        severity: 'warning'
      })
    }
  }

  // 月間夜勤回数チェック
  if (staff.maxNightShifts && (newShift.shiftType === '夜勤' || newShift.shiftType === '深夜勤')) {
    const currentNightShifts = calculateMonthlyNightShifts(shifts, year, month)
    if (currentNightShifts >= staff.maxNightShifts) {
      violations.push({
        type: 'night_shifts',
        message: `月間夜勤回数が上限（${staff.maxNightShifts}回）に達しています（現在: ${currentNightShifts}回）`,
        severity: 'warning'
      })
    }
  }

  return violations
}

// 月次サマリーを計算
export interface MonthlySummary {
  totalHours: number
  totalShifts: number
  nightShifts: number
  dayShifts: number
  eveningShifts: number
  averageHoursPerShift: number
}

export function calculateMonthlySummary(shifts: Shift[], year: number, month: number): MonthlySummary {
  const monthStart = startOfMonth(new Date(year, month - 1))
  const monthEnd = endOfMonth(new Date(year, month - 1))

  const monthlyShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.date)
    return shiftDate >= monthStart && shiftDate <= monthEnd
  })

  const totalMinutes = monthlyShifts.reduce((sum, shift) => {
    return sum + calculateWorkMinutes(shift.startTime, shift.endTime, shift.breakTime)
  }, 0)

  const nightShifts = monthlyShifts.filter(s => s.shiftType === '夜勤' || s.shiftType === '深夜勤').length
  const dayShifts = monthlyShifts.filter(s => s.shiftType === '日勤').length
  const eveningShifts = monthlyShifts.filter(s => s.shiftType === '準夜勤').length

  return {
    totalHours: minutesToHours(totalMinutes),
    totalShifts: monthlyShifts.length,
    nightShifts,
    dayShifts,
    eveningShifts,
    averageHoursPerShift: monthlyShifts.length > 0 ? minutesToHours(totalMinutes / monthlyShifts.length) : 0
  }
}
