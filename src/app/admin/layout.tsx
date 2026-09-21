import { Sidebar } from '@/components/admin/Sidebar'
import { requireAuth } from '@/lib/session'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAuth()
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 p-6 md:p-8">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  )
}
