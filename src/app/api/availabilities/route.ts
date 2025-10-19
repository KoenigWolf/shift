import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// バリデーションスキーマ
const availabilitySchema = z.object({
  staffId: z.string().cuid(),
  date: z.string().datetime(),
  isAvailable: z.boolean().default(true),
  preferredShiftTypes: z.array(z.string()).optional(),
  unavailableReason: z.string().optional(),
  priority: z.number().int().min(0).max(100).default(50),
  comment: z.string().optional(),
})

const bulkAvailabilitySchema = z.object({
  staffId: z.string().cuid(),
  availabilities: z.array(availabilitySchema.omit({ staffId: true })),
})

// GET: スタッフの勤務可能日時取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staffId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    if (staffId) where.staffId = staffId
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const availabilities = await prisma.availability.findMany({
      where,
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            role: true,
            color: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }],
    })

    return NextResponse.json({ success: true, data: availabilities })
  } catch (error) {
    console.error('GET /api/availabilities error:', error)
    return NextResponse.json(
      { success: false, error: '勤務可能日時の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 勤務可能日時を一括登録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 単一または一括登録を処理
    if (Array.isArray(body.availabilities)) {
      // 一括登録
      const validated = bulkAvailabilitySchema.parse(body)

      const results = await Promise.all(
        validated.availabilities.map(async (avail) => {
          const date = new Date(avail.date)

          return prisma.availability.upsert({
            where: {
              staffId_date: {
                staffId: validated.staffId,
                date,
              },
            },
            update: {
              isAvailable: avail.isAvailable,
              preferredShiftTypes: avail.preferredShiftTypes
                ? JSON.stringify(avail.preferredShiftTypes)
                : null,
              unavailableReason: avail.unavailableReason,
              priority: avail.priority,
              comment: avail.comment,
            },
            create: {
              staffId: validated.staffId,
              date,
              isAvailable: avail.isAvailable,
              preferredShiftTypes: avail.preferredShiftTypes
                ? JSON.stringify(avail.preferredShiftTypes)
                : null,
              unavailableReason: avail.unavailableReason,
              priority: avail.priority,
              comment: avail.comment,
            },
          })
        })
      )

      return NextResponse.json({ success: true, data: results }, { status: 201 })
    } else {
      // 単一登録
      const validated = availabilitySchema.parse(body)
      const date = new Date(validated.date)

      const availability = await prisma.availability.upsert({
        where: {
          staffId_date: {
            staffId: validated.staffId,
            date,
          },
        },
        update: {
          isAvailable: validated.isAvailable,
          preferredShiftTypes: validated.preferredShiftTypes
            ? JSON.stringify(validated.preferredShiftTypes)
            : null,
          unavailableReason: validated.unavailableReason,
          priority: validated.priority,
          comment: validated.comment,
        },
        create: {
          staffId: validated.staffId,
          date,
          isAvailable: validated.isAvailable,
          preferredShiftTypes: validated.preferredShiftTypes
            ? JSON.stringify(validated.preferredShiftTypes)
            : null,
          unavailableReason: validated.unavailableReason,
          priority: validated.priority,
          comment: validated.comment,
        },
        include: {
          staff: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      })

      return NextResponse.json({ success: true, data: availability }, { status: 201 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'バリデーションエラー', details: error.issues },
        { status: 400 }
      )
    }
    console.error('POST /api/availabilities error:', error)
    return NextResponse.json(
      { success: false, error: '勤務可能日時の登録に失敗しました' },
      { status: 500 }
    )
  }
}
