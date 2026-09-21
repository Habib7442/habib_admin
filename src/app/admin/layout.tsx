import { Sidebar } from '@/components/admin/Sidebar'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAuth()
  const unread = await sanityWrite.fetch<number>(
    'count(*[_type == "contactMessage" && coalesce(status, "new") == "new"])'
  )
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <Sidebar unreadMessages={unread} />
      <main className="min-w-0 flex-1 p-6 md:p-8">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  )
}
