import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { shiftSchema } from '@/lib/validations/shift'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const shift = await prisma.shift.findUnique({
      where: { id: params.id },
      include: {
        staff: true,
      },
    })
    
    if (!shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(shift)
  } catch (error) {
    console.error('Error fetching shift:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shift' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = shiftSchema.parse(body)
    
    const shift = await prisma.shift.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        staff: true,
      },
    })
    
    return NextResponse.json(shift)
  } catch (error) {
    console.error('Error updating shift:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update shift' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.shift.delete({
      where: { id: params.id },
    })
    
    return NextResponse.json({ message: 'Shift deleted successfully' })
  } catch (error) {
    console.error('Error deleting shift:', error)
    return NextResponse.json(
      { error: 'Failed to delete shift' },
      { status: 500 }
    )
  }
}
