import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { staffSchema } from '@/lib/validations/staff'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: { shifts: true },
    })
    
    if (!staff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
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
    console.log('Updating staff with data:', body)

    const validatedData = staffSchema.parse(body)
    console.log('Validated staff data:', validatedData)

    const staff = await prisma.staff.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error updating staff:', error)

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
      { error: 'Failed to update staff', details: error instanceof Error ? error.message : String(error) },
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
    await prisma.staff.delete({
      where: { id },
    })
    
    return NextResponse.json({ message: 'Staff deleted successfully' })
  } catch (error) {
    console.error('Error deleting staff:', error)
    return NextResponse.json(
      { error: 'Failed to delete staff' },
      { status: 500 }
    )
  }
}
