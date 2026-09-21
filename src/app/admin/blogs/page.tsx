import Image from 'next/image'
import Link from 'next/link'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteButton } from './DeleteButton'

type Item = {
  _id: string
  title: string
  status?: string
  excerpt?: string
  category?: string
  publishedAt?: string
  coverUrl?: string
  featured?: boolean
}

const FILTERS = [
  { value: undefined, label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
]

export default async function BlogsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAuth()
  const { status: raw } = await searchParams
  const status = raw === 'published' || raw === 'draft' ? raw : undefined

  const items = await sanityWrite.fetch<Item[]>(
    `*[_type == "blog" && (!defined($status) || status == $status)] | order(coalesce(publishedAt, _createdAt) desc) {
      _id, title, status, excerpt, category, publishedAt, featured, "coverUrl": coverImage.asset->url
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Blogs</h1>
        <Button asChild>
          <Link href="/admin/blogs/new">+ New post</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link key={f.label} href={f.value ? `/admin/blogs?status=${f.value}` : '/admin/blogs'} className={chip(status === f.value)}>
            {f.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-neutral-400">No posts here yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) => (
            <div key={b._id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              {b.coverUrl && (
                <div className="relative aspect-video">
                  <Image src={`${b.coverUrl}?w=800&auto=format`} alt={b.title} fill sizes="400px" className="object-cover" />
                </div>
              )}
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-medium text-white">{b.title}</h2>
                  <div className="flex shrink-0 gap-1">
                    {b.featured && <Badge>Featured</Badge>}
                    <Badge variant={b.status === 'published' ? 'default' : 'outline'}>
                      {b.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>
                {b.excerpt && <p className="line-clamp-2 text-sm text-neutral-400">{b.excerpt}</p>}
                <p className="text-xs text-neutral-500">
                  {[b.category, b.publishedAt && new Date(b.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/blogs/${b._id}/edit`}>Edit</Link>
                  </Button>
                  <DeleteButton id={b._id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
