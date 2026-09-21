import Image from 'next/image'
import Link from 'next/link'
import { FolderKanban, LayoutTemplate, Star, Users } from 'lucide-react'
import { requireAuth } from '@/lib/session'
import { sanityWrite } from '@/lib/sanity'
import { Button } from '@/components/ui/button'

type Recent = { _id: string; title: string; imageUrl?: string; ratingCount?: number; ratingTotal?: number }
type Stats = { total: number; projects: number; ratingCount: number; ratingTotal: number; recent: Recent[] }

export default async function DashboardPage() {
  await requireAuth()
  const base = '_type == "landingPage" && !(_id in path("drafts.**"))'
  const stats = await sanityWrite.fetch<Stats>(`{
    "total": count(*[${base}]),
    "projects": count(*[_type == "project" && !(_id in path("drafts.**"))]),
    "ratingCount": math::sum(*[${base}].ratingCount),
    "ratingTotal": math::sum(*[${base}].ratingTotal),
    "recent": *[${base}] | order(_createdAt desc)[0...4] {
      _id, title, "imageUrl": image.asset->url, ratingCount, ratingTotal
    }
  }`)

  const ratingCount = stats.ratingCount ?? 0
  const avg = ratingCount ? ((stats.ratingTotal ?? 0) / ratingCount).toFixed(1) : '—'

  const cards = [
    { label: 'Landing pages', value: stats.total, icon: LayoutTemplate },
    { label: 'Projects', value: stats.projects, icon: FolderKanban },
    { label: 'Total ratings', value: ratingCount, icon: Users },
    { label: 'Average rating', value: avg, icon: Star },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-neutral-400">Overview of your portfolio content.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-sm">{c.label}</span>
              <c.icon className="size-4" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-white">{c.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Recent uploads</h2>
          <Button asChild size="sm">
            <Link href="/admin/landing-pages/new">+ Upload new</Link>
          </Button>
        </div>

        {stats.recent.length === 0 ? (
          <p className="text-neutral-400">Nothing uploaded yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.recent.map((r) => (
              <Link
                key={r._id}
                href="/admin/landing-pages"
                className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20"
              >
                {r.imageUrl && (
                  <div className="relative aspect-video">
                    <Image src={`${r.imageUrl}?w=500&auto=format`} alt={r.title} fill sizes="300px" className="object-cover" />
                  </div>
                )}
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-white">{r.title}</p>
                  <p className="text-xs text-neutral-400">
                    {r.ratingCount ? `★ ${((r.ratingTotal ?? 0) / r.ratingCount).toFixed(1)} (${r.ratingCount})` : 'No ratings yet'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
