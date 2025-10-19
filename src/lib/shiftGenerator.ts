/**
 * シフト自動生成アルゴリズム
 * スタッフの希望、制約条件、勤務可能日を考慮してシフトを自動生成
 */

import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, parseISO } from 'date-fns'

export interface StaffWithConstraints {
  id: string
  name: string
  role: string
  canWorkNight: boolean
  maxConsecutiveDays: number | null
  maxMonthlyHours: number | null
  maxNightShifts: number | null
  preferredShifts: string[]
  notPreferred: string[]
  unavailableDates: Date[]
  maxDaysPerWeek: number | null
}

export interface ShiftAssignment {
  staffId: string
  date: Date
  shiftType: string
  startTime: string
  endTime: string
  breakTime: number
  score: number // マッチングスコア（希望との一致度）
}

export interface GenerationConfig {
  targetMonth: Date
  minStaffPerShift: number
  maxStaffPerShift: number
  prioritizePreferences: boolean
  balanceWorkload: boolean
  shiftTemplates: {
    shiftType: string
    startTime: string
    endTime: string
    breakTime: number
    requiredCount: number
  }[]
}

export interface GenerationResult {
  assignments: ShiftAssignment[]
  summary: {
    totalAssignments: number
    staffUtilization: Record<string, number>
    preferenceMatchRate: number
    unassignedDays: string[]
    warnings: string[]
  }
}

/**
 * シフトを自動生成
 */
export async function generateShifts(config: GenerationConfig): Promise<GenerationResult> {
  // 1. スタッフ情報と希望を取得
  const staffData = await fetchStaffWithPreferences(config.targetMonth)

  // 2. 月の全日付を取得
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(config.targetMonth),
    end: endOfMonth(config.targetMonth),
  })

  // 3. 各日付にシフトを割り当て
  const assignments: ShiftAssignment[] = []
  const warnings: string[] = []

  for (const day of daysInMonth) {
    for (const template of config.shiftTemplates) {
      const dayAssignments = assignStaffToShift(
        day,
        template,
        staffData,
        assignments,
        config
      )

      if (dayAssignments.length < template.requiredCount) {
        warnings.push(
          `${format(day, 'yyyy-MM-dd')} の ${template.shiftType} で人員不足: ${dayAssignments.length}/${template.requiredCount}名`
        )
      }

      assignments.push(...dayAssignments)
    }
  }

  // 4. サマリー生成
  const summary = generateSummary(assignments, staffData, warnings)

  return {
    assignments,
    summary,
  }
}

/**
 * スタッフの希望と制約を取得
 */
async function fetchStaffWithPreferences(
  targetMonth: Date
): Promise<StaffWithConstraints[]> {
  const monthStart = startOfMonth(targetMonth)
  const monthEnd = endOfMonth(targetMonth)

  // スタッフ情報取得
  const staff = await prisma.staff.findMany({
    include: {
      shiftPreferences: {
        where: {
          targetMonth: monthStart,
        },
      },
      availabilities: {
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
          isAvailable: false,
        },
      },
    },
  })

  return staff.map((s) => {
    const pref = s.shiftPreferences[0]
    return {
      id: s.id,
      name: s.name,
      role: s.role,
      canWorkNight: s.canWorkNight,
      maxConsecutiveDays: s.maxConsecutiveDays,
      maxMonthlyHours: s.maxMonthlyHours,
      maxNightShifts: s.maxNightShifts,
      preferredShifts: pref ? JSON.parse(pref.preferredShifts) : [],
      notPreferred: pref?.notPreferred ? JSON.parse(pref.notPreferred) : [],
      unavailableDates: s.availabilities.map((a) => typeof a.date === 'string' ? parseISO(a.date) : a.date),
      maxDaysPerWeek: pref?.maxDaysPerWeek || null,
    }
  })
}

/**
 * 特定の日のシフトにスタッフを割り当て
 */
function assignStaffToShift(
  date: Date,
  template: GenerationConfig['shiftTemplates'][0],
  staffData: StaffWithConstraints[],
  existingAssignments: ShiftAssignment[],
  config: GenerationConfig
): ShiftAssignment[] {
  const assignments: ShiftAssignment[] = []

  // スタッフをスコアリング
  const scoredStaff = staffData
    .map((staff) => ({
      staff,
      score: calculateStaffScore(staff, date, template, existingAssignments, config),
    }))
    .filter((s) => s.score > 0) // スコア0は割り当て不可
    .sort((a, b) => b.score - a.score) // スコア降順

  // 上位から割り当て
  const assignCount = Math.min(template.requiredCount, config.maxStaffPerShift)
  for (let i = 0; i < assignCount && i < scoredStaff.length; i++) {
    const { staff, score } = scoredStaff[i]

    assignments.push({
      staffId: staff.id,
      date,
      shiftType: template.shiftType,
      startTime: template.startTime,
      endTime: template.endTime,
      breakTime: template.breakTime,
      score,
    })
  }

  return assignments
}

/**
 * スタッフのスコアリング（希望、制約を考慮）
 */
function calculateStaffScore(
  staff: StaffWithConstraints,
  date: Date,
  template: GenerationConfig['shiftTemplates'][0],
  existingAssignments: ShiftAssignment[],
  config: GenerationConfig
): number {
  let score = 50 // 基本スコア

  // 1. 勤務不可日チェック
  if (staff.unavailableDates.some((d) => isSameDay(d, date))) {
    return 0 // 割り当て不可
  }

  // 2. 夜勤制約チェック
  const isNightShift = template.shiftType === '夜勤' || template.shiftType === '深夜勤'
  if (isNightShift && !staff.canWorkNight) {
    return 0 // 夜勤不可
  }

  // 3. この日に既に割り当てられているかチェック
  const alreadyAssignedToday = existingAssignments.some(
    (a) => a.staffId === staff.id && isSameDay(a.date, date)
  )
  if (alreadyAssignedToday) {
    return 0 // 1日に複数シフト割り当て不可
  }

  // 4. 連続勤務日数チェック
  if (staff.maxConsecutiveDays) {
    const consecutiveDays = calculateConsecutiveDays(staff.id, date, existingAssignments)
    if (consecutiveDays >= staff.maxConsecutiveDays) {
      score -= 30
    }
  }

  // 5. 月間夜勤回数チェック
  if (isNightShift && staff.maxNightShifts) {
    const nightShiftCount = existingAssignments.filter(
      (a) =>
        a.staffId === staff.id &&
        (a.shiftType === '夜勤' || a.shiftType === '深夜勤')
    ).length
    if (nightShiftCount >= staff.maxNightShifts) {
      score -= 40
    }
  }

  // 6. 希望シフトとのマッチング
  if (config.prioritizePreferences) {
    if (staff.preferredShifts.includes(template.shiftType)) {
      score += 30 // 希望シフトなら高スコア
    }
    if (staff.notPreferred.includes(template.shiftType)) {
      score -= 20 // 非希望シフトなら減点
    }
  }

  // 7. 業務負荷の均等化
  if (config.balanceWorkload) {
    const staffAssignmentCount = existingAssignments.filter(
      (a) => a.staffId === staff.id
    ).length
    const avgAssignmentCount =
      existingAssignments.length / Math.max(1, new Set(existingAssignments.map((a) => a.staffId)).size)

    if (staffAssignmentCount < avgAssignmentCount) {
      score += 10 // 勤務が少ない人を優先
    } else if (staffAssignmentCount > avgAssignmentCount) {
      score -= 10
    }
  }

  return Math.max(0, score)
}

/**
 * 連続勤務日数を計算
 */
function calculateConsecutiveDays(
  staffId: string,
  date: Date,
  assignments: ShiftAssignment[]
): number {
  const staffAssignments = assignments
    .filter((a) => a.staffId === staffId)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  let consecutive = 0
  let currentDate = new Date(date)
  currentDate.setDate(currentDate.getDate() - 1)

  while (
    staffAssignments.some((a) => isSameDay(a.date, currentDate))
  ) {
    consecutive++
    currentDate.setDate(currentDate.getDate() - 1)
  }

  return consecutive
}

/**
 * 生成結果のサマリーを作成
 */
function generateSummary(
  assignments: ShiftAssignment[],
  staffData: StaffWithConstraints[],
  warnings: string[]
) {
  const staffUtilization: Record<string, number> = {}
  let totalPreferenceMatch = 0
  let totalAssignments = assignments.length

  staffData.forEach((staff) => {
    const staffAssignments = assignments.filter((a) => a.staffId === staff.id)
    staffUtilization[staff.name] = staffAssignments.length

    // 希望一致率を計算
    staffAssignments.forEach((assignment) => {
      if (staff.preferredShifts.includes(assignment.shiftType)) {
        totalPreferenceMatch++
      }
    })
  })

  const preferenceMatchRate =
    totalAssignments > 0 ? (totalPreferenceMatch / totalAssignments) * 100 : 0

  return {
    totalAssignments,
    staffUtilization,
    preferenceMatchRate,
    unassignedDays: [],
    warnings,
  }
}
