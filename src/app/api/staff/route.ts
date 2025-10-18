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
    const validatedData = staffSchema.parse(body)
    
    const staff = await prisma.staff.create({
      data: validatedData,
    })
    
    return NextResponse.json(staff, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create staff' },
      { status: 500 }
    )
  }
}
