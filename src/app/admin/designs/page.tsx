import Image from 'next/image'
import Link from 'next/link'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { DESIGN_CATEGORIES, DESIGN_CATEGORY_VALUES, designCategoryLabel } from '@/lib/design-categories'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteButton } from './DeleteButton'

type Item = {
  _id: string
  title: string
  category?: string
  description?: string
  imageUrl?: string
  extraCount?: number
  tools?: string[]
  featured?: boolean
}

export default async function DesignsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  await requireAuth()
  const { category: raw } = await searchParams
  const category = raw && DESIGN_CATEGORY_VALUES.includes(raw) ? raw : undefined

  const items = await sanityWrite.fetch<Item[]>(
    `*[_type == "design" && (!defined($category) || category == $category)] | order(_createdAt desc) {
      _id, title, category, description, tools, featured,
      "imageUrl": image.asset->url,
      "extraCount": count(images)
    }`,
    { category: category ?? null }
  )

  const chip = (active: boolean) =>
    cn(
      'rounded-full border px-3 py-1 text-sm transition-colors',
      active ? 'border-violet-500 bg-violet-500/15 text-white' : 'border-white/10 text-neutral-400 hover:text-white'
    )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Designs</h1>
        <Button asChild>
          <Link href="/admin/designs/new">+ Upload design</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/designs" className={chip(!category)}>All</Link>
        {DESIGN_CATEGORIES.map((c) => (
          <Link key={c.value} href={`/admin/designs?category=${c.value}`} className={chip(category === c.value)}>
            {c.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-neutral-400">{category ? 'No designs in this category.' : 'No designs yet.'}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((d) => (
            <div key={d._id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              {d.imageUrl && (
                <div className="relative aspect-square bg-black/30">
                  <Image src={`${d.imageUrl}?w=800&auto=format`} alt={d.title} fill sizes="400px" className="object-contain" />
                </div>
              )}
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-medium text-white">{d.title}</h2>
                  {d.featured && <Badge>Featured</Badge>}
                </div>
                <p className="text-xs text-neutral-500">
                  {designCategoryLabel(d.category)}
                  {!!d.extraCount && ` · +${d.extraCount} more image${d.extraCount > 1 ? 's' : ''}`}
                </p>
                {d.description && <p className="line-clamp-2 text-sm text-neutral-400">{d.description}</p>}
                {!!d.tools?.length && <p className="line-clamp-1 text-xs text-neutral-400">{d.tools.join(' · ')}</p>}
                <div className="flex justify-end gap-2 pt-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/designs/${d._id}/edit`}>Edit</Link>
                  </Button>
                  <DeleteButton id={d._id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
