import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { shiftSchema } from '@/lib/validations/shift'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const staffId = searchParams.get('staffId')

    const where: any = {}
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }
    
    if (staffId) {
      where.staffId = staffId
    }

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        staff: true,
      },
      orderBy: { date: 'asc' },
    })
    
    return NextResponse.json(shifts)
  } catch (error) {
    console.error('Error fetching shifts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shifts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received shift data:', body)

    const validatedData = shiftSchema.parse(body)
    console.log('Validated shift data:', validatedData)

    const shift = await prisma.shift.create({
      data: validatedData,
      include: {
        staff: true,
      },
    })

    return NextResponse.json(shift, { status: 201 })
  } catch (error) {
    console.error('Error creating shift:', error)

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
      { error: 'Failed to create shift', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
