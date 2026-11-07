import Image from 'next/image'
import Link from 'next/link'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { Button } from '@/components/ui/button'
import { TEMPLATE_CATEGORY_OPTIONS, TEMPLATE_TYPE_OPTIONS } from '@/lib/template-categories'
import { DeleteButton } from './DeleteButton'

type Item = {
  _id: string
  title: string
  templateType: string
  slug?: string
  category?: string
  isFree?: boolean
  price?: string
  featured?: boolean
  slideCount: number
  coverUrl?: string
}

export default async function TemplatesPage() {
  await requireAuth()
  const items = await sanityWrite.fetch<Item[]>(
    `*[_type == "carouselTemplate" && !(_id in path("drafts.**"))] | order(coalesce(order, 0) asc, _createdAt desc) {
      _id, title, "templateType": coalesce(templateType, "carousel"), "slug": slug.current, category, isFree, price, featured,
      "slideCount": count(slides), "coverUrl": slides[0].asset->url
    }`
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Templates</h1>
          <p className="text-sm text-neutral-400">Canva templates (carousels, reels, stories, posts), shown on the portfolio&apos;s /templates pages.</p>
        </div>
        <Button asChild>
          <Link href="/admin/templates/new">+ Add template</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-neutral-400">No templates yet. The /templates page stays empty until you add one.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              <div className="relative aspect-[3/4] bg-white/5">
                {item.coverUrl ? (
                  <Image src={`${item.coverUrl}?w=600&auto=format`} alt={item.title} fill sizes="400px" className="object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center text-sm text-neutral-500">No slides</span>
                )}
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-medium text-white">{item.title}</h2>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs text-neutral-300">
                    {item.isFree ? 'Free' : item.price || 'Paid'}
                  </span>
                </div>
                <p className="text-sm text-neutral-400">
                  {[
                    TEMPLATE_TYPE_OPTIONS.find((t) => t.value === item.templateType)?.label,
                    TEMPLATE_CATEGORY_OPTIONS.find((c) => c.value === item.category)?.label,
                    `${item.slideCount} images`,
                    item.featured && 'On home page',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/templates/${item._id}/edit`}>Edit</Link>
                  </Button>
                  <DeleteButton id={item._id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
