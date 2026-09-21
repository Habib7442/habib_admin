import Image from 'next/image'
import { sanityWrite } from '@/lib/sanity'
import { getMyRatings } from '@/lib/rated'
import { StarRating } from '@/components/StarRating'

export const dynamic = 'force-dynamic'

type Item = {
  _id: string
  title: string
  description?: string
  liveUrl?: string
  imageUrl?: string
  imageAlt?: string
  ratingCount?: number
  ratingTotal?: number
}

export default async function HomePage() {
  const [items, mine] = await Promise.all([
    sanityWrite.fetch<Item[]>(
      `*[_type == "landingPage"] | order(_createdAt desc) {
        _id, title, description, liveUrl, "imageUrl": image.asset->url, "imageAlt": image.alt, ratingCount, ratingTotal
      }`
    ),
    getMyRatings(),
  ])

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 p-6 md:p-10">
      <h1 className="text-3xl font-semibold text-white">Landing page designs</h1>
      <p className="mt-1 text-neutral-400">Rate the designs you like.</p>

      {items.length === 0 ? (
        <p className="mt-10 text-neutral-400">No designs yet.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item._id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              {item.imageUrl && (
                <div className="relative aspect-video">
                  <Image
                    src={`${item.imageUrl}?w=900&auto=format`}
                    alt={item.imageAlt || item.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="space-y-3 p-4">
                <h2 className="text-lg font-medium text-white">{item.title}</h2>
                {item.description && <p className="text-sm text-neutral-400">{item.description}</p>}
                <StarRating
                  id={item._id}
                  ratingCount={item.ratingCount ?? 0}
                  ratingTotal={item.ratingTotal ?? 0}
                  myRating={mine[item._id]}
                />
                {item.liveUrl && (
                  <a href={item.liveUrl} target="_blank" rel="noreferrer" className="inline-block text-sm text-violet-400 hover:underline">
                    View live ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
