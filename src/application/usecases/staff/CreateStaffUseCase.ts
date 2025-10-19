/**
 * Create Staff Use Case - Application Layer
 * Single Responsibility Principle（単一責任の原則）を適用
 */

import { Staff, createEmail } from '@/domain/entities/Staff'
import { IStaffRepository } from '@/domain/repositories/IStaffRepository'
import { Result, success, failure } from '@/shared/utils/Result'
import { AppError, ErrorCode } from '@/shared/errors/AppError'

export interface CreateStaffInput {
  readonly name: string
  readonly email: string
  readonly role: string
  readonly qualification?: string | null
  readonly employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT'
  readonly color: string
  readonly maxConsecutiveDays?: number | null
  readonly maxMonthlyHours?: number | null
  readonly maxNightShifts?: number | null
  readonly canWorkNight: boolean
}

export interface CreateStaffOutput {
  readonly staff: Staff
}

export class CreateStaffUseCase {
  constructor(
    private readonly staffRepository: IStaffRepository
  ) {}

  async execute(input: CreateStaffInput): Promise<Result<CreateStaffOutput, AppError>> {
    try {
      // 入力バリデーション
      const validationResult = this.validateInput(input)
      if (!validationResult.isSuccess) {
        return validationResult
      }

      // メールアドレスの重複チェック
      const email = createEmail(input.email)
      const existingStaff = await this.staffRepository.findByEmail(email)

      if (existingStaff) {
        console.warn('Attempt to create staff with duplicate email', input.email)
        return failure(
          new AppError(
            ErrorCode.DUPLICATE_EMAIL,
            'このメールアドレスは既に使用されています',
            { email: input.email }
          )
        )
      }

      // スタッフ作成
      const staff = await this.staffRepository.create({
        name: input.name,
        email,
        role: input.role,
        qualification: input.qualification ?? null,
        employmentType: input.employmentType,
        color: input.color,
        constraints: {
          maxConsecutiveDays: input.maxConsecutiveDays ?? null,
          maxMonthlyHours: input.maxMonthlyHours ?? null,
          maxNightShifts: input.maxNightShifts ?? null,
          canWorkNight: input.canWorkNight,
        },
      })

      console.log('Staff created successfully', staff.id.value)

      return success({ staff })
    } catch (error) {
      console.error('Failed to create staff', error)

      if (error instanceof AppError) {
        return failure(error)
      }

      return failure(
        new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          'スタッフの作成に失敗しました',
          { originalError: error }
        )
      )
    }
  }

  private validateInput(input: CreateStaffInput): Result<void, AppError> {
    // 名前の検証
    if (!input.name || input.name.trim().length === 0) {
      return failure(
        new AppError(ErrorCode.VALIDATION_ERROR, '名前は必須です')
      )
    }

    if (input.name.length > 100) {
      return failure(
        new AppError(ErrorCode.VALIDATION_ERROR, '名前は100文字以内で入力してください')
      )
    }

    // 役職の検証
    const validRoles = ['正看護師', '准看護師', '看護助手', '主任', '師長']
    if (!validRoles.includes(input.role)) {
      return failure(
        new AppError(ErrorCode.VALIDATION_ERROR, '無効な役職です')
      )
    }

    // 制約の検証
    if (input.maxConsecutiveDays !== null && input.maxConsecutiveDays !== undefined) {
      if (input.maxConsecutiveDays < 1 || input.maxConsecutiveDays > 31) {
        return failure(
          new AppError(ErrorCode.VALIDATION_ERROR, '最大連続勤務日数は1〜31の範囲で指定してください')
        )
      }
    }

    if (input.maxMonthlyHours !== null && input.maxMonthlyHours !== undefined) {
      if (input.maxMonthlyHours < 1 || input.maxMonthlyHours > 744) {
        return failure(
          new AppError(ErrorCode.VALIDATION_ERROR, '月間最大勤務時間は1〜744の範囲で指定してください')
        )
      }
    }

    if (input.maxNightShifts !== null && input.maxNightShifts !== undefined) {
      if (input.maxNightShifts < 0 || input.maxNightShifts > 31) {
        return failure(
          new AppError(ErrorCode.VALIDATION_ERROR, '月間最大夜勤回数は0〜31の範囲で指定してください')
        )
      }
    }

    return success(undefined)
  }
}
