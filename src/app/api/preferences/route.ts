import { NextRequest } from 'next/server'
import { preferenceRepository } from '@/lib/repositories'
import { withErrorHandling, successResponse, withValidation, getQueryParams } from '@/lib/api/apiHandler'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const shiftPreferenceSchema = z.object({
  staffId: z.string().cuid(),
  targetMonth: z.string().datetime(),
  preferredShifts: z.array(z.string()),
  notPreferred: z.array(z.string()).optional(),
  maxDaysPerWeek: z.number().int().min(1).max(7).optional(),
  comment: z.string().optional(),
  status: z.enum(['下書き', '提出済み', '確認済み']).default('提出済み'),
})

type ShiftPreferenceBody = z.infer<typeof shiftPreferenceSchema>

export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = getQueryParams(request)
  const staffId = searchParams.get('staffId')
  const targetMonth = searchParams.get('targetMonth')

  let preferences
  if (staffId && targetMonth) {
    preferences = await preferenceRepository.findByStaffIdAndMonth(
      staffId,
      new Date(targetMonth)
    )
    preferences = preferences ? [preferences] : []
  } else if (staffId) {
    preferences = await preferenceRepository.findByStaffId(staffId)
  } else if (targetMonth) {
    preferences = await preferenceRepository.findByTargetMonth(new Date(targetMonth))
  } else {
    preferences = await preferenceRepository.findAll()
  }

  return successResponse(preferences)
})

export const POST = withValidation<ShiftPreferenceBody>(
  shiftPreferenceSchema,
  async (request: NextRequest, validated: ShiftPreferenceBody) => {
    const targetMonth = new Date(validated.targetMonth)
    
    const preference = await preferenceRepository.upsert(
      validated.staffId,
      targetMonth,
      {
        staff: { connect: { id: validated.staffId } },
        targetMonth,
        preferredShifts: JSON.stringify(validated.preferredShifts),
        notPreferred: validated.notPreferred
          ? JSON.stringify(validated.notPreferred)
          : null,
        maxDaysPerWeek: validated.maxDaysPerWeek,
        comment: validated.comment,
        status: validated.status,
        submittedAt: new Date(),
      }
    )

    return successResponse(preference, 201)
  }
)
