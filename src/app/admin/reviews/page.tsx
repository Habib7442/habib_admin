import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteButton } from './DeleteButton'
import { setReviewStatus } from './actions'

type Item = {
  _id: string
  submittedAt: string
  name: string
  role?: string
  rating: number
  review: string
  status?: string
  consent?: boolean
  photoUrl?: string
}

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'hidden', label: 'Hidden' },
]
const ACTIONS: Record<string, { to: string; label: string }[]> = {
  pending: [
    { to: 'approved', label: 'Approve' },
    { to: 'hidden', label: 'Hide' },
  ],
  approved: [{ to: 'hidden', label: 'Hide from site' }],
  hidden: [{ to: 'approved', label: 'Approve' }],
}

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAuth()
  const { status: raw } = await searchParams
  const status = STATUSES.some((s) => s.value === raw) ? raw : undefined

  const items = await sanityWrite.fetch<Item[]>(
    `*[_type == "review" && (!defined($status) || coalesce(status, "pending") == $status)]
      | order(coalesce(submittedAt, _createdAt) desc) {
        _id, "submittedAt": coalesce(submittedAt, _createdAt), name, role, rating, review, status, consent, "photoUrl": photo.asset->url
      }`,
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
        <h1 className="text-2xl font-semibold text-white">Reviews</h1>
        <p className="text-sm text-neutral-400">
          Sent from the review form on your portfolio. Nothing is shown publicly until you approve it.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/reviews" className={chip(!status)}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s.value} href={`/admin/reviews?status=${s.value}`} className={chip(status === s.value)}>
            {s.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-neutral-400">No reviews here.</p>
      ) : (
        <div className="space-y-4">
          {items.map((r) => {
            const current = r.status ?? 'pending'
            return (
              <article key={r._id} className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {r.photoUrl ? (
                      <Image
                        src={`${r.photoUrl}?w=120&h=120&fit=crop&auto=format`}
                        alt={r.name}
                        width={48}
                        height={48}
                        className="size-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex size-12 items-center justify-center rounded-full bg-violet-500/20 font-medium text-violet-300">
                        {r.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div>
                      <h2 className="font-medium text-white">{r.name}</h2>
                      {r.role && <p className="text-sm text-neutral-400">{r.role}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Badge variant={current === 'pending' ? 'default' : 'outline'}>
                      {STATUSES.find((s) => s.value === current)?.label ?? current}
                    </Badge>
                    {new Date(r.submittedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>

                <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={cn('size-4', n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-600')} />
                  ))}
                </div>
                <p className="whitespace-pre-wrap break-words text-sm text-neutral-300">{r.review}</p>
                {!r.consent && <p className="text-xs text-amber-400">Reviewer did not agree to be shown publicly.</p>}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {(ACTIONS[current] ?? []).map((a) => (
                    <form key={a.to} action={setReviewStatus.bind(null, r._id, a.to)}>
                      <Button type="submit" variant={a.to === 'approved' ? 'default' : 'outline'} size="sm">
                        {a.label}
                      </Button>
                    </form>
                  ))}
                  <div className="ml-auto"><DeleteButton id={r._id} /></div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
