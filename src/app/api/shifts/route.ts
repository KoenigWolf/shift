import { NextResponse } from 'next/server'
import { shiftRepository } from '@/lib/repositories'
import { shiftSchema } from '@/lib/validations/shift'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const staffId = searchParams.get('staffId')

    let shifts

    if (staffId) {
      shifts = await shiftRepository.findByStaffId(staffId)
    } else if (startDate && endDate) {
      shifts = await shiftRepository.findByDateRange(
        new Date(startDate),
        new Date(endDate)
      )
    } else {
      shifts = await shiftRepository.findAll()
    }

    return NextResponse.json({
      success: true,
      data: shifts,
    })
  } catch (error) {
    console.error('Error fetching shifts:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch shifts',
        details: error instanceof Error ? error.message : String(error),
      },
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

    const shift = await shiftRepository.create(validatedData)

    return NextResponse.json(
      {
        success: true,
        data: shift,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating shift:', error)

    // Zodエラーの場合
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      console.error('Zod validation error:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error,
        },
        { status: 400 }
      )
    }

    // Prismaエラーの場合
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Prisma error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          details: String(error),
        },
        { status: 500 }
      )
    }

    // その他のエラー
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create shift',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
