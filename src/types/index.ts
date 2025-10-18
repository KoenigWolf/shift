import { Staff, Shift, ShiftTemplate } from '@prisma/client'

export type StaffWithShifts = Staff & {
  shifts: Shift[]
}

export type ShiftWithStaff = Shift & {
  staff: Staff
}

export type CreateStaffInput = Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>
export type CreateShiftInput = Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>

export type ShiftTemplateInput = Omit<ShiftTemplate, 'id' | 'createdAt'>

// シフト表示用の型
export type ShiftDisplay = {
  id: string
  staffName: string
  staffColor: string
  date: string
  startTime: string
  endTime: string
  breakTime: number
  memo?: string
}

// カレンダー表示用の型
export type CalendarShift = {
  id: string
  staffId: string
  staffName: string
  staffColor: string
  date: Date
  startTime: string
  endTime: string
  breakTime: number
  memo?: string
}
