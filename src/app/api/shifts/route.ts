import { NextRequest } from 'next/server'
import { shiftRepository } from '@/lib/repositories'
import { shiftSchema } from '@/lib/validations/shift'
import { withErrorHandling, successResponse, withValidation, getQueryParams } from '@/lib/api/apiHandler'
import { z } from 'zod'

type ShiftBody = z.infer<typeof shiftSchema>

export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = getQueryParams(request)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const staffId = searchParams.get('staffId')

  let shifts

  if (staffId) {
    shifts = await shiftRepository.findByStaffId(staffId)
  } else if (startDate && endDate) {
    shifts = await shiftRepository.findByDateRange(
      new Date(startDate),
      new Date(endDate)
    )
  } else {
    shifts = await shiftRepository.findAll()
  }

  return successResponse(shifts)
})

export const POST = withValidation<ShiftBody>(
  shiftSchema,
  async (request: NextRequest, validatedData: ShiftBody) => {
    const shift = await shiftRepository.create(validatedData)
    return successResponse(shift, 201)
  }
)
