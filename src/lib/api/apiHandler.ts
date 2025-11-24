import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, z } from 'zod'
import { handleApiError } from './handleApiError'

/**
 * APIハンドラーの型定義
 */
type ApiHandler<TParams = Record<string, string>, TResponse = unknown> = (
  request: NextRequest,
  context?: { params?: Promise<TParams> }
) => Promise<NextResponse>

/**
 * 成功レスポンスを作成
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<{ success: true; data: T }> {
  return NextResponse.json({ success: true, data }, { status })
}

/**
 * エラーハンドリング付きAPIハンドラーラッパー
 */
export function withErrorHandling<TParams = Record<string, string>, TResponse = unknown>(
  handler: ApiHandler<TParams, TResponse>
): ApiHandler<TParams, TResponse> {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * バリデーション付きAPIハンドラーラッパー
 */
export function withValidation<TBody, TParams = Record<string, string>, TResponse = unknown>(
  schema: ZodSchema<TBody>,
  handler: (
    request: NextRequest,
    body: z.infer<typeof schema>,
    context?: { params?: Promise<TParams> }
  ) => Promise<NextResponse>
): ApiHandler<TParams, TResponse> {
  return withErrorHandling(async (request, context) => {
    const body = await request.json()
    const validatedBody = schema.parse(body)
    return await handler(request, validatedBody, context)
  })
}

/**
 * パラメータ取得ヘルパー
 */
export async function getParams<TParams = Record<string, string>>(
  context?: { params?: Promise<TParams> }
): Promise<TParams> {
  return context?.params ? await context.params : ({} as TParams)
}

/**
 * クエリパラメータ取得ヘルパー
 */
export function getQueryParams(request: NextRequest): URLSearchParams {
  const { searchParams } = new URL(request.url)
  return searchParams
}

