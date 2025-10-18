import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { templateSchema } from '@/lib/validations/template'

export async function GET() {
  try {
    const templates = await prisma.shiftTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = templateSchema.parse(body)
    
    const template = await prisma.shiftTemplate.create({
      data: validatedData,
    })
    
    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
