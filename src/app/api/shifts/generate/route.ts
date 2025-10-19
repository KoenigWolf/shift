import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateShifts, GenerationConfig } from '@/lib/shiftGenerator'
import { startOfMonth, parseISO } from 'date-fns'
import { z } from 'zod'

const generateRequestSchema = z.object({
  targetMonth: z.string().datetime(),
  minStaffPerShift: z.number().int().min(1).default(3),
  maxStaffPerShift: z.number().int().min(1).default(8),
  prioritizePreferences: z.boolean().default(true),
  balanceWorkload: z.boolean().default(true),
  shiftTemplates: z
    .array(
      z.object({
        shiftType: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        breakTime: z.number().int().min(0),
        requiredCount: z.number().int().min(1),
      })
    )
    .min(1),
})

/**
 * POST: シフトを自動生成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = generateRequestSchema.parse(body)

    const targetMonth = parseISO(validated.targetMonth)

    // 設定をデータベースに保存
    const config = await prisma.shiftGenerationConfig.create({
      data: {
        targetMonth: startOfMonth(targetMonth),
        minStaffPerShift: validated.minStaffPerShift,
        maxStaffPerShift: validated.maxStaffPerShift,
        prioritizePreferences: validated.prioritizePreferences,
        balanceWorkload: validated.balanceWorkload,
        status: '生成中',
      },
    })

    try {
      // シフト生成実行
      const generationConfig: GenerationConfig = {
        targetMonth,
        minStaffPerShift: validated.minStaffPerShift,
        maxStaffPerShift: validated.maxStaffPerShift,
        prioritizePreferences: validated.prioritizePreferences,
        balanceWorkload: validated.balanceWorkload,
        shiftTemplates: validated.shiftTemplates,
      }

      const result = await generateShifts(generationConfig)

      // 生成されたシフトをデータベースに保存（下書きとして）
      const createdShifts = await Promise.all(
        result.assignments.map((assignment) =>
          prisma.shift.create({
            data: {
              staffId: assignment.staffId,
              date: assignment.date,
              shiftType: assignment.shiftType,
              startTime: assignment.startTime,
              endTime: assignment.endTime,
              breakTime: assignment.breakTime,
              status: '下書き',
              isPublished: false,
            },
          })
        )
      )

      // 設定を更新
      await prisma.shiftGenerationConfig.update({
        where: { id: config.id },
        data: {
          status: '完了',
          lastGeneratedAt: new Date(),
          resultSummary: JSON.stringify(result.summary),
        },
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            shifts: createdShifts,
            summary: result.summary,
            configId: config.id,
          },
        },
        { status: 201 }
      )
    } catch (error) {
      // エラー時は設定のステータスを更新
      await prisma.shiftGenerationConfig.update({
        where: { id: config.id },
        data: {
          status: 'エラー',
          resultSummary: JSON.stringify({ error: String(error) }),
        },
      })
      throw error
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'バリデーションエラー', details: error.issues },
        { status: 400 }
      )
    }
    console.error('POST /api/shifts/generate error:', error)
    return NextResponse.json(
      { success: false, error: 'シフトの自動生成に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * GET: 生成履歴を取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetMonth = searchParams.get('targetMonth')

    const where: any = {}
    if (targetMonth) {
      where.targetMonth = parseISO(targetMonth)
    }

    const configs = await prisma.shiftGenerationConfig.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({ success: true, data: configs })
  } catch (error) {
    console.error('GET /api/shifts/generate error:', error)
    return NextResponse.json(
      { success: false, error: '生成履歴の取得に失敗しました' },
      { status: 500 }
    )
  }
}
