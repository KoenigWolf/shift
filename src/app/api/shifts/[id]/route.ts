import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { shiftSchema } from '@/lib/validations/shift'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const shift = await prisma.shift.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    console.log('Updating shift with data:', body)

    const validatedData = shiftSchema.parse(body)
    console.log('Validated shift data:', validatedData)

    const shift = await prisma.shift.update({
      where: { id },
      data: validatedData,
      include: {
        staff: true,
      },
    })

    return NextResponse.json(shift)
  } catch (error) {
    console.error('Error updating shift:', error)

    // Zodエラーの場合
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      console.error('Zod validation error:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'Invalid request data', details: error },
        { status: 400 }
      )
    }

    // Prismaエラーの場合
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Prisma error:', error)
      return NextResponse.json(
        { error: 'Database error', details: String(error) },
        { status: 500 }
      )
    }

    // その他のエラー
    return NextResponse.json(
      { error: 'Failed to update shift', details: error instanceof Error ? error.message : String(error) },
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
    await prisma.shift.delete({
      where: { id },
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
