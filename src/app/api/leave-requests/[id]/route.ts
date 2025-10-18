import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { leaveRequestSchema } from '@/lib/validations/leaveRequest'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        staff: true,
      },
    })

    if (!leaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error('Error fetching leave request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave request' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = leaveRequestSchema.parse(body)

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: validatedData,
      include: {
        staff: true,
      },
    })

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error('Error updating leave request:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update leave request' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.leaveRequest.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Leave request deleted successfully' })
  } catch (error) {
    console.error('Error deleting leave request:', error)
    return NextResponse.json(
      { error: 'Failed to delete leave request' },
      { status: 500 }
    )
  }
}
