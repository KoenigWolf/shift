import { NextRequest } from 'next/server'
import { leaveRequestRepository } from '@/lib/repositories'
import { leaveRequestSchema } from '@/lib/validations/leaveRequest'
import { withErrorHandling, successResponse, withValidation, getQueryParams } from '@/lib/api/apiHandler'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

type LeaveRequestBody = z.infer<typeof leaveRequestSchema>

export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = getQueryParams(request)
  const staffId = searchParams.get('staffId')
  const status = searchParams.get('status')

  const where: Prisma.LeaveRequestWhereInput = {}
  if (staffId) where.staffId = staffId
  if (status) where.status = status

  const leaveRequests = await leaveRequestRepository.findAll(where)
  return successResponse(leaveRequests)
})

export const POST = withValidation<LeaveRequestBody>(
  leaveRequestSchema,
  async (request: NextRequest, validatedData: LeaveRequestBody) => {
    const leaveRequest = await leaveRequestRepository.create(validatedData)
    return successResponse(leaveRequest, 201)
  }
)
