import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { AppError, ErrorCode, toAppError, isAppError } from '@/shared/errors/AppError'

/**
 * ZodエラーをAppErrorに変換
 */
export function handleZodError(error: ZodError): AppError {
  const issues = error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))

  return new AppError(
    ErrorCode.VALIDATION_ERROR,
    'バリデーションエラーが発生しました',
    { issues },
    400
  )
}

/**
 * PrismaエラーをAppErrorに変換
 */
export function handlePrismaError(error: unknown): AppError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return new AppError(
          ErrorCode.DUPLICATE_RESOURCE,
          '一意制約違反: 既に存在するリソースです',
          { code: error.code, meta: error.meta },
          409
        )
      case 'P2025':
        return new AppError(
          ErrorCode.NOT_FOUND,
          'リソースが見つかりません',
          { code: error.code },
          404
        )
      case 'P2003':
        return new AppError(
          ErrorCode.CONSTRAINT_VIOLATION,
          '外部キー制約違反が発生しました',
          { code: error.code, meta: error.meta },
          422
        )
      default:
        return new AppError(
          ErrorCode.DATABASE_ERROR,
          'データベースエラーが発生しました',
          { code: error.code, message: error.message },
          500
        )
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new AppError(
      ErrorCode.VALIDATION_ERROR,
      'データベースバリデーションエラー',
      { message: error.message },
      400
    )
  }

  return new AppError(
    ErrorCode.DATABASE_ERROR,
    'データベースエラーが発生しました',
    { error: String(error) },
    500
  )
}

/**
 * エラーをAppErrorに変換
 */
export function normalizeError(error: unknown): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof ZodError) {
    return handleZodError(error)
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Prisma.PrismaClientValidationError) {
    return handlePrismaError(error)
  }

  return toAppError(error)
}

/**
 * AppErrorをNextResponseに変換
 */
export function errorToResponse(error: AppError, includeStack = false): NextResponse {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const errorResponse = includeStack || isDevelopment ? error.toDetailedJSON() : error.toJSON()

  return NextResponse.json(errorResponse, { status: error.statusCode })
}

/**
 * APIエラーハンドラー
 * エラーをキャッチして適切なレスポンスに変換
 */
export function handleApiError(error: unknown): NextResponse {
  const appError = normalizeError(error)
  
  // 開発環境ではスタックトレースをログに出力
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', {
      code: appError.code,
      message: appError.message,
      statusCode: appError.statusCode,
      metadata: appError.metadata,
      stack: appError.stack,
    })
  } else {
    console.error('API Error:', {
      code: appError.code,
      message: appError.message,
      statusCode: appError.statusCode,
    })
  }

  return errorToResponse(appError, false)
}

