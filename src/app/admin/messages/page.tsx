import Link from 'next/link'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteButton } from './DeleteButton'
import { setMessageStatus } from './actions'

type Item = {
  _id: string
  _createdAt: string
  name: string
  email: string
  subject?: string
  message: string
  status?: string
}

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
]
const label = (v?: string) => STATUSES.find((s) => s.value === v)?.label ?? 'New'

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAuth()
  const { status: raw } = await searchParams
  const status = STATUSES.some((s) => s.value === raw) ? raw : undefined

  const items = await sanityWrite.fetch<Item[]>(
    `*[_type == "contactMessage" && (!defined($status) || coalesce(status, "new") == $status)]
      | order(_createdAt desc) { _id, _createdAt, name, email, subject, message, status }`,
    { status: status ?? null }
  )

  const chip = (active: boolean) =>
    cn(
      'rounded-full border px-3 py-1 text-sm transition-colors',
      active ? 'border-violet-500 bg-violet-500/15 text-white' : 'border-white/10 text-neutral-400 hover:text-white'
    )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Messages</h1>
        <p className="text-sm text-neutral-400">Sent from the contact form on your portfolio.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/messages" className={chip(!status)}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s.value} href={`/admin/messages?status=${s.value}`} className={chip(status === s.value)}>
            {s.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-neutral-400">No messages here.</p>
      ) : (
        <div className="space-y-4">
          {items.map((m) => {
            const current = m.status ?? 'new'
            const replySubject = encodeURIComponent(`Re: ${m.subject || 'your message'}`)
            return (
              <article key={m._id} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-medium text-white">{m.name}</h2>
                    <a href={`mailto:${m.email}`} className="text-sm text-violet-400 hover:underline">{m.email}</a>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Badge variant={current === 'new' ? 'default' : 'outline'}>{label(current)}</Badge>
                    {new Date(m._createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>

                {m.subject && <p className="text-sm font-medium text-neutral-200">{m.subject}</p>}
                <p className="whitespace-pre-wrap break-words text-sm text-neutral-300">{m.message}</p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button asChild size="sm">
                    <a href={`mailto:${m.email}?subject=${replySubject}`}>Reply by email</a>
                  </Button>
                  {STATUSES.filter((s) => s.value !== current).map((s) => (
                    <form key={s.value} action={setMessageStatus.bind(null, m._id, s.value)}>
                      <Button type="submit" variant="outline" size="sm">
                        {s.value === 'new' ? 'Mark unread' : `Mark ${s.label.toLowerCase()}`}
                      </Button>
                    </form>
                  ))}
                  <div className="ml-auto"><DeleteButton id={m._id} /></div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
