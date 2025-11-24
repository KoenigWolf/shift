import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { shiftRepository } from '@/lib/repositories'
import { generateShifts, GenerationConfig } from '@/lib/shiftGenerator'
import { startOfMonth, parseISO } from 'date-fns'
import { z } from 'zod'
import { withErrorHandling, successResponse, withValidation, getQueryParams } from '@/lib/api/apiHandler'

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

type GenerateRequestBody = z.infer<typeof generateRequestSchema>

export const POST = withValidation<GenerateRequestBody>(
  generateRequestSchema,
  async (request: NextRequest, validated: GenerateRequestBody) => {
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
          shiftRepository.create({
            staffId: assignment.staffId,
            date: assignment.date,
            shiftType: assignment.shiftType,
            startTime: assignment.startTime,
            endTime: assignment.endTime,
            breakTime: assignment.breakTime,
            status: '下書き',
            isPublished: false,
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

      return successResponse(
        {
          shifts: createdShifts,
          summary: result.summary,
          configId: config.id,
        },
        201
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
  }
)

export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = getQueryParams(request)
  const targetMonth = searchParams.get('targetMonth')

  const where: Record<string, unknown> = {}
  if (targetMonth) {
    where.targetMonth = parseISO(targetMonth)
  }

  const configs = await prisma.shiftGenerationConfig.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return successResponse(configs)
})
