/**
 * Result Type - Functional Error Handling
 * Railway Oriented Programming パターンを実装
 * エラーを型安全に扱うための汎用的な Result 型
 */

export type Result<T, E = Error> = Success<T> | Failure<E>

export interface Success<T> {
  readonly isSuccess: true
  readonly isFailure: false
  readonly value: T
}

export interface Failure<E> {
  readonly isSuccess: false
  readonly isFailure: true
  readonly error: E
}

/**
 * 成功を表すResultを作成
 */
export const success = <T>(value: T): Success<T> => ({
  isSuccess: true,
  isFailure: false,
  value,
})

/**
 * 失敗を表すResultを作成
 */
export const failure = <E>(error: E): Failure<E> => ({
  isSuccess: false,
  isFailure: true,
  error,
})

/**
 * Result型のmap関数
 */
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> => {
  if (result.isSuccess) {
    return success(fn(result.value))
  }
  return result
}

/**
 * Result型のflatMap関数（モナドのbind）
 */
export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> => {
  if (result.isSuccess) {
    return fn(result.value)
  }
  return result
}

/**
 * Result型のmapError関数
 */
export const mapError = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> => {
  if (result.isFailure) {
    return failure(fn(result.error))
  }
  return result
}

/**
 * 複数のResultを結合（全て成功の場合のみ成功）
 */
export const combine = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
  const values: T[] = []

  for (const result of results) {
    if (result.isFailure) {
      return result
    }
    values.push(result.value)
  }

  return success(values)
}

/**
 * Resultから値を取り出す（成功の場合）、失敗の場合はデフォルト値を返す
 */
export const getOrElse = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  return result.isSuccess ? result.value : defaultValue
}

/**
 * Resultから値を取り出す（成功の場合）、失敗の場合は例外をスロー
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.isSuccess) {
    return result.value
  }
  throw result.error
}

/**
 * Promiseを扱うための非同期版Result
 */
export const fromPromise = async <T, E = Error>(
  promise: Promise<T>,
  errorMapper?: (error: unknown) => E
): Promise<Result<T, E>> => {
  try {
    const value = await promise
    return success(value)
  } catch (error) {
    const mappedError = errorMapper ? errorMapper(error) : (error as E)
    return failure(mappedError)
  }
}

/**
 * 複数の非同期Resultを並列実行
 */
export const combineAsync = async <T, E>(
  promises: Promise<Result<T, E>>[]
): Promise<Result<T[], E>> => {
  const results = await Promise.all(promises)
  return combine(results)
}
