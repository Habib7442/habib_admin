import { Sidebar } from '@/components/admin/Sidebar'
import { Toaster } from 'sonner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Sidebar />
      <main className="flex-1 ml-[240px] p-8 md:p-12 max-w-[1400px] mx-auto min-h-screen">
        {children}
      </main>
      <Toaster position="top-right" theme="dark" closeButton richColors />
    </div>
  )
}
