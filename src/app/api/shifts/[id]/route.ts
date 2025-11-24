import { NextRequest } from 'next/server'
import { shiftRepository } from '@/lib/repositories'
import { shiftSchema } from '@/lib/validations/shift'
import { NotFoundError } from '@/shared/errors/AppError'
import { withErrorHandling, successResponse, withValidation, getParams } from '@/lib/api/apiHandler'
import { z } from 'zod'

type ShiftParams = { id: string }
type ShiftBody = z.infer<typeof shiftSchema>

export const GET = withErrorHandling<ShiftParams>(async (
  request: NextRequest,
  context?: { params?: Promise<ShiftParams> }
) => {
  const { id } = await getParams<ShiftParams>(context)
  const shift = await shiftRepository.findById(id)
  
  if (!shift) {
    throw new NotFoundError('シフト', id)
  }
  
  return successResponse(shift)
})

export const PUT = withValidation<ShiftBody, ShiftParams>(
  shiftSchema,
  async (
    request: NextRequest,
    validatedData: ShiftBody,
    context?: { params?: Promise<ShiftParams> }
  ) => {
    const { id } = await getParams<ShiftParams>(context)
    const shift = await shiftRepository.update(id, validatedData)
    return successResponse(shift)
  }
)

export const DELETE = withErrorHandling<ShiftParams>(async (
  request: NextRequest,
  context?: { params?: Promise<ShiftParams> }
) => {
  const { id } = await getParams<ShiftParams>(context)
  await shiftRepository.delete(id)
  return successResponse({ message: 'シフトを削除しました' })
})
