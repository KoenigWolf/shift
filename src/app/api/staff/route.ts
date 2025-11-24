import { NextRequest } from 'next/server'
import { staffRepository } from '@/lib/repositories'
import { staffSchema } from '@/lib/validations/staff'
import { withErrorHandling, successResponse, withValidation } from '@/lib/api/apiHandler'
import { z } from 'zod'

type StaffBody = z.infer<typeof staffSchema>

export const GET = withErrorHandling(async () => {
  const staff = await staffRepository.findAll()
  return successResponse(staff)
})

export const POST = withValidation<StaffBody>(
  staffSchema,
  async (request: NextRequest, validatedData: StaffBody) => {
    const staff = await staffRepository.create(validatedData)
    return successResponse(staff, 201)
  }
)
