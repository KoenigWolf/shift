'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { Staff, Shift } from '@prisma/client'
import { calculateMonthlySummary } from '@/lib/shiftUtils'
import { toast } from 'sonner'

type StaffWithShifts = Staff & { shifts: Shift[] }

export default function ReportsPage() {
  const [staff, setStaff] = useState<StaffWithShifts[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/staff')
      if (response.ok) {
        const staffData = await response.json()

        // 各スタッフのシフトを取得
        const staffWithShifts = await Promise.all(
          staffData.map(async (s: Staff) => {
            const shiftsResponse = await fetch(`/api/shifts?staffId=${s.id}`)
            const shifts = shiftsResponse.ok ? await shiftsResponse.json() : []
            return { ...s, shifts }
          })
        )

        setStaff(staffWithShifts)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const summaries = staff.map(s => ({
    staff: s,
    summary: calculateMonthlySummary(s.shifts, selectedYear, selectedMonth)
  }))

  const totalHours = summaries.reduce((sum, s) => sum + s.summary.totalHours, 0)
  const totalShifts = summaries.reduce((sum, s) => sum + s.summary.totalShifts, 0)
  const totalNightShifts = summaries.reduce((sum, s) => sum + s.summary.nightShifts, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              勤務実績レポート
            </h1>
            <Button variant="outline" className="shadow-md hover:shadow-lg transition-shadow">
              <Download className="h-4 w-4 mr-2" />
              Excel出力
            </Button>
          </div>

          {/* 期間選択 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">年</label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(Number(value))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}年
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">月</label>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(Number(value))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month} value={month.toString()}>
                          {month}月
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* サマリーカード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">総勤務時間</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalHours.toFixed(1)}<span className="text-lg text-gray-500 ml-1">時間</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">総シフト数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalShifts}<span className="text-lg text-gray-500 ml-1">件</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">夜勤回数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalNightShifts}<span className="text-lg text-gray-500 ml-1">回</span></div>
              </CardContent>
            </Card>
          </div>

          {/* スタッフ別集計テーブル */}
          <Card>
            <CardHeader>
              <CardTitle>スタッフ別勤務実績</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>スタッフ名</TableHead>
                    <TableHead>役職</TableHead>
                    <TableHead className="text-right">シフト数</TableHead>
                    <TableHead className="text-right">勤務時間</TableHead>
                    <TableHead className="text-right">日勤</TableHead>
                    <TableHead className="text-right">夜勤</TableHead>
                    <TableHead className="text-right">準夜勤</TableHead>
                    <TableHead className="text-right">平均時間/日</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaries.map(({ staff, summary }) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{staff.role}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{summary.totalShifts}</TableCell>
                      <TableCell className="text-right font-medium">{summary.totalHours.toFixed(1)}h</TableCell>
                      <TableCell className="text-right">{summary.dayShifts}</TableCell>
                      <TableCell className="text-right">{summary.nightShifts}</TableCell>
                      <TableCell className="text-right">{summary.eveningShifts}</TableCell>
                      <TableCell className="text-right">{summary.averageHoursPerShift.toFixed(1)}h</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
