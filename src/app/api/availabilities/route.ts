import { NextRequest } from 'next/server'
import { availabilityRepository } from '@/lib/repositories'
import { withErrorHandling, successResponse, getQueryParams } from '@/lib/api/apiHandler'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const availabilitySchema = z.object({
  staffId: z.string().cuid(),
  date: z.string().datetime(),
  isAvailable: z.boolean().default(true),
  preferredShiftTypes: z.array(z.string()).optional(),
  unavailableReason: z.string().optional(),
  priority: z.number().int().min(0).max(100).default(50),
  comment: z.string().optional(),
})

const bulkAvailabilitySchema = z.object({
  staffId: z.string().cuid(),
  availabilities: z.array(availabilitySchema.omit({ staffId: true })),
})

export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = getQueryParams(request)
  const staffId = searchParams.get('staffId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  let availabilities
  if (staffId && startDate && endDate) {
    availabilities = await availabilityRepository.findByDateRange(
      new Date(startDate),
      new Date(endDate)
    )
    availabilities = availabilities.filter((a) => a.staffId === staffId)
  } else if (staffId) {
    availabilities = await availabilityRepository.findByStaffId(staffId)
  } else if (startDate && endDate) {
    availabilities = await availabilityRepository.findByDateRange(
      new Date(startDate),
      new Date(endDate)
    )
  } else {
    availabilities = await availabilityRepository.findAll()
  }

  return successResponse(availabilities)
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json()

  // 一括登録
  if (Array.isArray(body.availabilities)) {
    const validated = bulkAvailabilitySchema.parse(body)

    const results = await availabilityRepository.upsertMany(
      validated.availabilities.map((avail) => ({
        staffId: validated.staffId,
        date: new Date(avail.date),
        data: {
          staff: { connect: { id: validated.staffId } },
          date: new Date(avail.date),
          isAvailable: avail.isAvailable,
          preferredShiftTypes: avail.preferredShiftTypes
            ? JSON.stringify(avail.preferredShiftTypes)
            : null,
          unavailableReason: avail.unavailableReason,
          priority: avail.priority,
          comment: avail.comment,
        },
      }))
    )

    return successResponse(results, 201)
  }

  // 単一登録
  const validated = availabilitySchema.parse(body)
  const date = new Date(validated.date)

  const availability = await availabilityRepository.upsert(validated.staffId, date, {
    staff: { connect: { id: validated.staffId } },
    date,
    isAvailable: validated.isAvailable,
    preferredShiftTypes: validated.preferredShiftTypes
      ? JSON.stringify(validated.preferredShiftTypes)
      : null,
    unavailableReason: validated.unavailableReason,
    priority: validated.priority,
    comment: validated.comment,
  })

  return successResponse(availability, 201)
})
