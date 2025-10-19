import { NextResponse } from 'next/server'
import { staffRepository } from '@/lib/repositories'
import { staffSchema } from '@/lib/validations/staff'

export async function GET() {
  try {
    const staff = await staffRepository.findAll()
    return NextResponse.json({
      success: true,
      data: staff,
    })
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch staff',
        details: error instanceof Error ? error.message : String(error),
      },
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

    const staff = await staffRepository.create(validatedData)

    return NextResponse.json(
      {
        success: true,
        data: staff,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating staff:', error)

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
        error: 'Failed to create staff',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
