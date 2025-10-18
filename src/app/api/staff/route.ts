import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { staffSchema } from '@/lib/validations/staff'

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received staff data:', body)

    const validatedData = staffSchema.parse(body)
    console.log('Validated staff data:', validatedData)

    const staff = await prisma.staff.create({
      data: validatedData,
    })

    return NextResponse.json(staff, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)

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
      { error: 'Failed to create staff', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
