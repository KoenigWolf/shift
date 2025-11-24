import { NextRequest } from 'next/server'
import { leaveRequestRepository } from '@/lib/repositories'
import { leaveRequestSchema } from '@/lib/validations/leaveRequest'
import { NotFoundError } from '@/shared/errors/AppError'
import { withErrorHandling, successResponse, withValidation, getParams } from '@/lib/api/apiHandler'
import { z } from 'zod'

type LeaveRequestParams = { id: string }
type LeaveRequestBody = z.infer<typeof leaveRequestSchema>

export const GET = withErrorHandling<LeaveRequestParams>(async (
  request: NextRequest,
  context?: { params?: Promise<LeaveRequestParams> }
) => {
  const { id } = await getParams<LeaveRequestParams>(context)
  const leaveRequest = await leaveRequestRepository.findById(id)

  if (!leaveRequest) {
    throw new NotFoundError('休暇申請', id)
  }

  return successResponse(leaveRequest)
})

export const PUT = withValidation<LeaveRequestBody, LeaveRequestParams>(
  leaveRequestSchema,
  async (
    request: NextRequest,
    validatedData: LeaveRequestBody,
    context?: { params?: Promise<LeaveRequestParams> }
  ) => {
    const { id } = await getParams<LeaveRequestParams>(context)
    const leaveRequest = await leaveRequestRepository.update(id, validatedData)
    return successResponse(leaveRequest)
  }
)

export const DELETE = withErrorHandling<LeaveRequestParams>(async (
  request: NextRequest,
  context?: { params?: Promise<LeaveRequestParams> }
) => {
  const { id } = await getParams<LeaveRequestParams>(context)
  await leaveRequestRepository.delete(id)
  return successResponse({ message: '休暇申請を削除しました' })
})
