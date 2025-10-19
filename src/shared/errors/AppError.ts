/**
 * Application Error Classes
 * 型安全で構造化されたエラーハンドリング
 */

export enum ErrorCode {
  // バリデーションエラー (400番台)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',

  // 認証・認可エラー (401, 403)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // リソース未検出エラー (404)
  NOT_FOUND = 'NOT_FOUND',
  STAFF_NOT_FOUND = 'STAFF_NOT_FOUND',
  SHIFT_NOT_FOUND = 'SHIFT_NOT_FOUND',

  // ビジネスロジックエラー (422)
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  INVALID_OPERATION = 'INVALID_OPERATION',

  // サーバーエラー (500番台)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

export interface ErrorMetadata {
  readonly [key: string]: unknown
}

/**
 * アプリケーション共通エラークラス
 */
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly metadata?: ErrorMetadata
  public readonly timestamp: Date

  constructor(
    code: ErrorCode,
    message: string,
    metadata?: ErrorMetadata,
    statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.metadata = metadata
    this.timestamp = new Date()
    this.statusCode = statusCode ?? this.getDefaultStatusCode(code)

    // スタックトレースを保持
    Error.captureStackTrace(this, this.constructor)
  }

  private getDefaultStatusCode(code: ErrorCode): number {
    switch (code) {
      case ErrorCode.VALIDATION_ERROR:
      case ErrorCode.INVALID_INPUT:
      case ErrorCode.DUPLICATE_EMAIL:
      case ErrorCode.DUPLICATE_RESOURCE:
        return 400

      case ErrorCode.UNAUTHORIZED:
      case ErrorCode.INVALID_TOKEN:
        return 401

      case ErrorCode.FORBIDDEN:
        return 403

      case ErrorCode.NOT_FOUND:
      case ErrorCode.STAFF_NOT_FOUND:
      case ErrorCode.SHIFT_NOT_FOUND:
        return 404

      case ErrorCode.BUSINESS_RULE_VIOLATION:
      case ErrorCode.CONSTRAINT_VIOLATION:
      case ErrorCode.INVALID_OPERATION:
        return 422

      case ErrorCode.INTERNAL_SERVER_ERROR:
      case ErrorCode.DATABASE_ERROR:
      case ErrorCode.EXTERNAL_SERVICE_ERROR:
      default:
        return 500
    }
  }

  /**
   * エラーをJSON形式に変換（API応答用）
   */
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        metadata: this.metadata,
        timestamp: this.timestamp.toISOString(),
      },
    }
  }

  /**
   * 開発環境用の詳細情報付きJSON
   */
  toDetailedJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        metadata: this.metadata,
        timestamp: this.timestamp.toISOString(),
        stack: this.stack,
      },
    }
  }
}

/**
 * バリデーションエラー専用クラス
 */
export class ValidationError extends AppError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(ErrorCode.VALIDATION_ERROR, message, metadata, 400)
    this.name = 'ValidationError'
  }
}

/**
 * 未検出エラー専用クラス
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource}が見つかりません (ID: ${id})`
      : `${resource}が見つかりません`

    super(ErrorCode.NOT_FOUND, message, { resource, id }, 404)
    this.name = 'NotFoundError'
  }
}

/**
 * ビジネスルール違反エラー
 */
export class BusinessRuleViolationError extends AppError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(ErrorCode.BUSINESS_RULE_VIOLATION, message, metadata, 422)
    this.name = 'BusinessRuleViolationError'
  }
}

/**
 * 制約違反エラー
 */
export class ConstraintViolationError extends AppError {
  constructor(constraint: string, currentValue: number, maxValue: number) {
    const message = `${constraint}の制約に違反しています（現在: ${currentValue}, 上限: ${maxValue}）`

    super(
      ErrorCode.CONSTRAINT_VIOLATION,
      message,
      { constraint, currentValue, maxValue },
      422
    )
    this.name = 'ConstraintViolationError'
  }
}

/**
 * エラーハンドリングユーティリティ
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError
}

export const toAppError = (error: unknown): AppError => {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      error.message,
      { originalError: error.name }
    )
  }

  return new AppError(
    ErrorCode.INTERNAL_SERVER_ERROR,
    '不明なエラーが発生しました',
    { error: String(error) }
  )
}
