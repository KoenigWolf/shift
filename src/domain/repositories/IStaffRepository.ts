/**
 * Staff Repository Interface - Domain Layer
 * Dependency Inversion Principle（依存性逆転の原則）を適用
 * ドメイン層がインフラ層に依存しないようにする
 */

import { Staff, StaffId, Email } from '../entities/Staff'

export interface IStaffRepository {
  /**
   * IDでスタッフを取得
   */
  findById(id: StaffId): Promise<Staff | null>

  /**
   * メールアドレスでスタッフを取得
   */
  findByEmail(email: Email): Promise<Staff | null>

  /**
   * 全スタッフを取得
   */
  findAll(): Promise<Staff[]>

  /**
   * スタッフを作成
   */
  create(staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<Staff>

  /**
   * スタッフを更新
   */
  update(id: StaffId, staff: Partial<Staff>): Promise<Staff>

  /**
   * スタッフを削除
   */
  delete(id: StaffId): Promise<void>

  /**
   * 夜勤可能なスタッフを取得
   */
  findNightShiftCapableStaff(): Promise<Staff[]>

  /**
   * 役職でフィルタリング
   */
  findByRole(role: string): Promise<Staff[]>
}
