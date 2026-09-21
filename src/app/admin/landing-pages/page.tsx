import Image from 'next/image'
import Link from 'next/link'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { Button } from '@/components/ui/button'
import { DeleteButton } from './DeleteButton'

type Item = {
  _id: string
  title: string
  description?: string
  liveUrl?: string
  imageUrl?: string
  ratingCount?: number
  ratingTotal?: number
}

export default async function AdminPage() {
  await requireAuth()
  const items = await sanityWrite.fetch<Item[]>(
    `*[_type == "landingPage" && !(_id in path("drafts.**"))] | order(_createdAt desc) {
      _id, title, description, liveUrl, "imageUrl": image.asset->url, ratingCount, ratingTotal
    }`
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Landing pages</h1>
        <Button asChild>
          <Link href="/admin/landing-pages/new">+ Upload new</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-neutral-400">Nothing uploaded yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const avg = item.ratingCount ? ((item.ratingTotal ?? 0) / item.ratingCount).toFixed(1) : null
            return (
              <div key={item._id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                {item.imageUrl && (
                  <div className="relative aspect-video">
                    <Image src={`${item.imageUrl}?w=800&auto=format`} alt={item.title} fill sizes="400px" className="object-cover" />
                  </div>
                )}
                <div className="space-y-2 p-4">
                  <h2 className="font-medium text-white">{item.title}</h2>
                  {item.description && <p className="line-clamp-2 text-sm text-neutral-400">{item.description}</p>}
                  <p className="text-sm text-neutral-400">{avg ? `★ ${avg} (${item.ratingCount})` : 'No ratings yet'}</p>
                  <div className="flex items-center justify-between pt-1">
                    {item.liveUrl ? (
                      <a href={item.liveUrl} target="_blank" rel="noreferrer" className="text-sm text-violet-400 hover:underline">
                        Live link ↗
                      </a>
                    ) : <span />}
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/landing-pages/${item._id}/edit`}>Edit</Link>
                      </Button>
                      <DeleteButton id={item._id} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
