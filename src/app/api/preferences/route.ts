import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// バリデーションスキーマ
const shiftPreferenceSchema = z.object({
  staffId: z.string().cuid(),
  targetMonth: z.string().datetime(),
  preferredShifts: z.array(z.string()),
  notPreferred: z.array(z.string()).optional(),
  maxDaysPerWeek: z.number().int().min(1).max(7).optional(),
  comment: z.string().optional(),
  status: z.enum(['下書き', '提出済み', '確認済み']).default('提出済み'),
})

// GET: スタッフの希望シフト一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staffId')
    const targetMonth = searchParams.get('targetMonth')

    const where: any = {}
    if (staffId) where.staffId = staffId
    if (targetMonth) where.targetMonth = new Date(targetMonth)

    const preferences = await prisma.shiftPreference.findMany({
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
      orderBy: [{ targetMonth: 'desc' }, { submittedAt: 'desc' }],
    })

    return NextResponse.json({ success: true, data: preferences })
  } catch (error) {
    console.error('GET /api/preferences error:', error)
    return NextResponse.json(
      { success: false, error: 'シフト希望の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: シフト希望を登録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = shiftPreferenceSchema.parse(body)

    // 既存の同じ月の希望があるかチェック
    const existing = await prisma.shiftPreference.findFirst({
      where: {
        staffId: validated.staffId,
        targetMonth: new Date(validated.targetMonth),
      },
    })

    let preference
    if (existing) {
      // 更新
      preference = await prisma.shiftPreference.update({
        where: { id: existing.id },
        data: {
          preferredShifts: JSON.stringify(validated.preferredShifts),
          notPreferred: validated.notPreferred
            ? JSON.stringify(validated.notPreferred)
            : null,
          maxDaysPerWeek: validated.maxDaysPerWeek,
          comment: validated.comment,
          status: validated.status,
          submittedAt: new Date(),
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
    } else {
      // 新規作成
      preference = await prisma.shiftPreference.create({
        data: {
          staffId: validated.staffId,
          targetMonth: new Date(validated.targetMonth),
          preferredShifts: JSON.stringify(validated.preferredShifts),
          notPreferred: validated.notPreferred
            ? JSON.stringify(validated.notPreferred)
            : null,
          maxDaysPerWeek: validated.maxDaysPerWeek,
          comment: validated.comment,
          status: validated.status,
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
    }

    return NextResponse.json({ success: true, data: preference }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'バリデーションエラー', details: error.issues },
        { status: 400 }
      )
    }
    console.error('POST /api/preferences error:', error)
    return NextResponse.json(
      { success: false, error: 'シフト希望の登録に失敗しました' },
      { status: 500 }
    )
  }
}
