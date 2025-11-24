import { NextRequest } from 'next/server'
import { staffRepository } from '@/lib/repositories'
import { staffSchema } from '@/lib/validations/staff'
import { NotFoundError } from '@/shared/errors/AppError'
import { withErrorHandling, successResponse, withValidation, getParams } from '@/lib/api/apiHandler'
import { z } from 'zod'

type StaffParams = { id: string }
type StaffBody = z.infer<typeof staffSchema>

export const GET = withErrorHandling<StaffParams>(async (
  request: NextRequest,
  context?: { params?: Promise<StaffParams> }
) => {
  const { id } = await getParams<StaffParams>(context)
  const staff = await staffRepository.findByIdWithShifts(id)
  
  if (!staff) {
    throw new NotFoundError('スタッフ', id)
  }
  
  return successResponse(staff)
})

export const PUT = withValidation<StaffBody, StaffParams>(
  staffSchema,
  async (
    request: NextRequest,
    validatedData: StaffBody,
    context?: { params?: Promise<StaffParams> }
  ) => {
    const { id } = await getParams<StaffParams>(context)
    const staff = await staffRepository.update(id, validatedData)
    return successResponse(staff)
  }
)

export const DELETE = withErrorHandling<StaffParams>(async (
  request: NextRequest,
  context?: { params?: Promise<StaffParams> }
) => {
  const { id } = await getParams<StaffParams>(context)
  await staffRepository.delete(id)
  return successResponse({ message: 'スタッフを削除しました' })
})
