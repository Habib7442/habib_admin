import Image from 'next/image'
import Link from 'next/link'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { Button } from '@/components/ui/button'
import { DeleteButton } from './DeleteButton'

type Item = { _id: string; name: string; oneLiner?: string; link?: string; status?: string; imageUrl?: string }

const STATUS_LABEL: Record<string, string> = { live: 'Live', beta: 'Beta', hackathon: 'Hackathon' }

export default async function ProductsPage() {
  await requireAuth()
  const items = await sanityWrite.fetch<Item[]>(
    `*[_type == "product" && !(_id in path("drafts.**"))] | order(coalesce(order, 0) asc, _createdAt asc) {
      _id, name, oneLiner, link, status, "imageUrl": image.asset->url
    }`
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Products</h1>
          <p className="text-sm text-neutral-400">Your own products, shown after Client work on the home page.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">+ Add product</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-neutral-400">No products yet. The section stays hidden until you add one.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              <div className="relative aspect-video bg-white/5">
                {item.imageUrl ? (
                  <Image src={`${item.imageUrl}?w=800&auto=format`} alt={item.name} fill sizes="400px" className="object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center text-sm text-neutral-500">No image</span>
                )}
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-medium text-white">{item.name}</h2>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-neutral-300">
                    {STATUS_LABEL[item.status ?? 'live'] ?? item.status}
                  </span>
                </div>
                {item.oneLiner && <p className="line-clamp-2 text-sm text-neutral-400">{item.oneLiner}</p>}
                <div className="flex items-center justify-between pt-1">
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noreferrer" className="text-sm text-violet-400 hover:underline">
                      Link ↗
                    </a>
                  ) : <span />}
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/products/${item._id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteButton id={item._id} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
