import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { leaveRequestSchema } from '@/lib/validations/leaveRequest'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staffId')
    const status = searchParams.get('status')

    const where: any = {}
    if (staffId) where.staffId = staffId
    if (status) where.status = status

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        staff: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    })

    return NextResponse.json(leaveRequests)
  } catch (error) {
    console.error('Error fetching leave requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = leaveRequestSchema.parse(body)

    const leaveRequest = await prisma.leaveRequest.create({
      data: validatedData,
      include: {
        staff: true,
      },
    })

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error('Error creating leave request:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create leave request' },
      { status: 500 }
    )
  }
}
