import { StaffList } from '@/components/staff/StaffList'
import { Header } from '@/components/layout/Header'

export default function StaffPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <StaffList />
      </main>
    </div>
  )
}
