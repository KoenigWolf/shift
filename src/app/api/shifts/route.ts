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
    const validatedData = shiftSchema.parse(body)
    
    const shift = await prisma.shift.create({
      data: validatedData,
      include: {
        staff: true,
      },
    })
    
    return NextResponse.json(shift, { status: 201 })
  } catch (error) {
    console.error('Error creating shift:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create shift' },
      { status: 500 }
    )
  }
}
