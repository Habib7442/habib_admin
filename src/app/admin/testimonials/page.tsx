import Link from 'next/link'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { Button } from '@/components/ui/button'
import { DeleteButton } from './DeleteButton'

type Item = { _id: string; quote: string; name: string; role?: string; business?: string }

export default async function TestimonialsPage() {
  await requireAuth()
  const items = await sanityWrite.fetch<Item[]>(
    `*[_type == "testimonial" && !(_id in path("drafts.**"))] | order(coalesce(order, 0) asc, _createdAt desc) {
      _id, quote, name, role, business
    }`
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Testimonials</h1>
          <p className="text-sm text-neutral-400">The first three show after Client work on the home page.</p>
        </div>
        <Button asChild>
          <Link href="/admin/testimonials/new">+ Add testimonial</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-neutral-400">No testimonials yet. The section stays hidden until you add one.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <figure key={item._id} className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-4">
              {i >= 3 && <p className="mb-2 text-xs text-amber-400">Not shown (only the first three are)</p>}
              <blockquote className="line-clamp-5 flex-1 text-sm text-neutral-200">&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 flex items-end justify-between gap-2 border-t border-white/10 pt-3">
                <div className="min-w-0">
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="truncate text-sm text-neutral-400">{[item.role, item.business].filter(Boolean).join(', ')}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/testimonials/${item._id}/edit`}>Edit</Link>
                  </Button>
                  <DeleteButton id={item._id} />
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}
